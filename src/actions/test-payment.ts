'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPaymentDetails(sessionId: string) {
  const supabase = await createClient()

  // Find order by session ID (stored in stripe_session_id field)
  const { data: orderData, error } = await supabase
    .from('orders')
    .select('id, order_number, grand_total, payment_status')
    .eq('stripe_session_id', sessionId)
    .single()

  const order = orderData as {
    id: string
    order_number: string
    grand_total: number
    payment_status: string
  } | null

  if (error || !order) {
    return { error: 'Төлбөрийн мэдээлэл олдсонгүй' }
  }

  return {
    details: {
      orderNumber: order.order_number,
      amount: order.grand_total,
      status: order.payment_status,
    },
  }
}

export async function confirmTestPayment(sessionId: string) {
  const supabase = await createClient()

  // Find order by session ID
  const { data: orderData, error: findError } = await supabase
    .from('orders')
    .select('id, order_number, payment_status')
    .eq('stripe_session_id', sessionId)
    .single()

  const order = orderData as { id: string; order_number: string; payment_status: string } | null

  if (findError || !order) {
    return { error: 'Захиалга олдсонгүй' }
  }

  if (order.payment_status === 'paid') {
    return { error: 'Энэ захиалга аль хэдийн төлөгдсөн байна' }
  }

  // Update order payment status to paid
  const { error: updateError } = await (supabase as any)
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'pending', // Order is paid but not yet processed
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error('Update order error:', updateError)
    return { error: 'Төлбөр баталгаажуулахад алдаа гарлаа' }
  }

  // Get order items to update inventory
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, product_id, variant_id, quantity, seller_id, seller_amount')
    .eq('order_id', order.id)

  const items = orderItems as Array<{
    id: string
    product_id: string
    variant_id: string
    quantity: number
    seller_id: string
    seller_amount: number
  }> | null

  // Update inventory for each item
  if (items) {
    for (const item of items) {
      // Decrement inventory quantity (inventory table is linked to variant_id)
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('variant_id', item.variant_id)
        .single()

      const inventory = inventoryData as { id: string; quantity: number } | null

      if (inventory) {
        await (supabase as any)
          .from('inventory')
          .update({
            quantity: Math.max(0, inventory.quantity - item.quantity),
          })
          .eq('id', inventory.id)
      }

      // Update seller stats
      if (item.seller_id) {
        const { data: sellerData } = await supabase
          .from('seller_profiles')
          .select('total_sales, total_revenue')
          .eq('id', item.seller_id)
          .single()

        const seller = sellerData as { total_sales: number; total_revenue: number } | null

        if (seller) {
          await (supabase as any)
            .from('seller_profiles')
            .update({
              total_sales: (seller.total_sales || 0) + 1,
              total_revenue: (seller.total_revenue || 0) + item.seller_amount,
            })
            .eq('id', item.seller_id)
        }
      }

      // Update product sales_count
      const { data: productData } = await supabase
        .from('products')
        .select('sales_count')
        .eq('id', item.product_id)
        .single()

      const product = productData as { sales_count: number } | null

      if (product) {
        await (supabase as any)
          .from('products')
          .update({
            sales_count: (product.sales_count || 0) + item.quantity,
          })
          .eq('id', item.product_id)
      }
    }
  }

  // Send notification to user (if notifications table exists)
  try {
    const { data: orderWithUser } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', order.id)
      .single()

    if (orderWithUser) {
      await (supabase as any)
        .from('notifications')
        .insert({
          user_id: (orderWithUser as any).user_id,
          type: 'order',
          title: 'Захиалга баталгаажлаа',
          message: `Таны #${order.order_number} захиалга амжилттай төлөгдлөө.`,
          data: { orderId: order.id, orderNumber: order.order_number },
        })
    }
  } catch (e) {
    // Notifications table might not exist, ignore error
    console.log('Could not send notification:', e)
  }

  revalidatePath('/account/orders')
  revalidatePath('/seller/orders')

  return {
    success: true,
    orderNumber: order.order_number,
  }
}
