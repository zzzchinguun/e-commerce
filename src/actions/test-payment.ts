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

  if (error || !orderData) {
    return { error: 'Төлбөрийн мэдээлэл олдсонгүй' }
  }

  return {
    details: {
      orderNumber: orderData.order_number,
      amount: orderData.grand_total,
      status: orderData.payment_status,
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

  if (findError || !orderData) {
    return { error: 'Захиалга олдсонгүй' }
  }

  if (orderData.payment_status === 'succeeded') {
    return { error: 'Энэ захиалга аль хэдийн төлөгдсөн байна' }
  }

  // Update order payment status to succeeded
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'pending', // Order is paid but not yet processed
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', orderData.id)

  if (updateError) {
    console.error('Update order error:', updateError)
    return { error: 'Төлбөр баталгаажуулахад алдаа гарлаа' }
  }

  // Get order items to update inventory
  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_id, variant_id, quantity, seller_id, seller_amount')
    .eq('order_id', orderData.id)

  // Update inventory for each item
  if (items) {
    for (const item of items) {
      // Decrement inventory quantity (inventory table is linked to variant_id)
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('variant_id', item.variant_id)
        .single()

      if (inventoryData) {
        await supabase
          .from('inventory')
          .update({
            quantity: Math.max(0, inventoryData.quantity - item.quantity),
          })
          .eq('id', inventoryData.id)
      }

      // Update seller stats
      if (item.seller_id) {
        const { data: sellerData } = await supabase
          .from('seller_profiles')
          .select('total_sales, total_revenue')
          .eq('id', item.seller_id)
          .single()

        if (sellerData) {
          await supabase
            .from('seller_profiles')
            .update({
              total_sales: (sellerData.total_sales || 0) + 1,
              total_revenue: Number(sellerData.total_revenue || 0) + item.seller_amount,
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

      if (productData) {
        await supabase
          .from('products')
          .update({
            sales_count: (productData.sales_count || 0) + item.quantity,
          })
          .eq('id', item.product_id)
      }
    }
  }

  // Send notification to user
  try {
    const { data: orderWithUser } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderData.id)
      .single()

    if (orderWithUser) {
      await supabase
        .from('notifications')
        .insert({
          user_id: orderWithUser.user_id,
          type: 'order_placed',
          title: 'Захиалга баталгаажлаа',
          message: `Таны #${orderData.order_number} захиалга амжилттай төлөгдлөө.`,
          data: { orderId: orderData.id, orderNumber: orderData.order_number },
        })
    }
  } catch (e) {
    // Log but don't fail the payment confirmation
    console.error('Failed to send notification:', e)
  }

  revalidatePath('/account/orders')
  revalidatePath('/seller/orders')

  return {
    success: true,
    orderNumber: orderData.order_number,
  }
}
