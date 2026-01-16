'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>
type OrderItem = Tables<'order_items'>

// ============================================
// CUSTOMER ORDER ACTIONS
// ============================================

export async function getUserOrders(options?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', orders: [] }
  }

  // Build query for user's orders
  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      subtotal,
      shipping_total,
      tax_total,
      grand_total,
      shipping_address,
      tracking_number,
      created_at,
      order_items (
        id,
        product_id,
        product_name,
        variant_options,
        unit_price,
        quantity,
        total,
        status,
        products (
          slug,
          product_images (
            url,
            is_primary
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply status filter
  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: orders, error, count } = await query

  if (error) {
    return { error: error.message, orders: [] }
  }

  // Transform orders data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedOrders = (orders as any[] || []).map((order) => ({
    id: order.order_number,
    orderId: order.id,
    date: new Date(order.created_at),
    status: order.status,
    paymentStatus: order.payment_status,
    total: order.grand_total,
    subtotal: order.subtotal,
    shippingTotal: order.shipping_total,
    taxTotal: order.tax_total,
    trackingNumber: order.tracking_number,
    shippingAddress: order.shipping_address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (order.order_items || []).map((item: any) => {
      const primaryImage = item.products?.product_images?.find(
        (img: { is_primary: boolean }) => img.is_primary
      )
      const firstImage = item.products?.product_images?.[0]
      return {
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        slug: item.products?.slug,
        quantity: item.quantity,
        price: item.unit_price,
        total: item.total,
        status: item.status,
        variantOptions: item.variant_options,
        image: primaryImage?.url || firstImage?.url || null,
      }
    }),
  }))

  return { orders: transformedOrders, count }
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      subtotal,
      shipping_total,
      tax_total,
      grand_total,
      shipping_address,
      billing_address,
      tracking_number,
      shipping_carrier,
      estimated_delivery_date,
      notes,
      created_at,
      confirmed_at,
      shipped_at,
      delivered_at,
      order_items (
        id,
        product_id,
        product_name,
        variant_options,
        sku,
        unit_price,
        quantity,
        subtotal,
        tax_amount,
        total,
        status,
        seller_id,
        products (
          slug,
          product_images (
            url,
            is_primary
          )
        ),
        seller_profiles (
          store_name,
          store_slug
        )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error || !order) {
    return { error: error?.message || 'Order not found' }
  }

  return { order }
}

// ============================================
// SELLER ORDER ACTIONS
// ============================================

export async function getSellerOrders(options?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Build query - get order items for this seller with order details
  let query = supabase
    .from('order_items')
    .select(`
      *,
      orders!inner (
        id,
        order_number,
        status,
        payment_status,
        shipping_address,
        created_at,
        user_id
      ),
      products (
        id,
        name,
        slug
      )
    `)
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false })

  // Apply status filter
  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  // Apply search filter
  if (options?.search) {
    query = query.ilike('product_name', `%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: orderItems, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = orderItems as any[] | null

  // Get customer details for each order
  const orderIds = [...new Set(items?.map((item) => item.orders?.user_id).filter(Boolean))]

  let customers: Record<string, { full_name: string; email: string }> = {}
  if (orderIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', orderIds)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customers = ((users as any[]) || []).reduce((acc, user) => {
      acc[user.id] = { full_name: user.full_name, email: user.email }
      return acc
    }, {} as Record<string, { full_name: string; email: string }>)
  }

  // Transform data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = items?.map((item: any) => ({
    id: item.id,
    orderId: item.orders?.id,
    orderNumber: item.orders?.order_number,
    status: item.status,
    paymentStatus: item.orders?.payment_status,
    productName: item.product_name,
    productId: item.products?.id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
    sellerAmount: item.seller_amount,
    customer: customers[item.orders?.user_id] || { full_name: 'Unknown', email: '' },
    shippingAddress: item.orders?.shipping_address,
    createdAt: item.orders?.created_at,
  }))

  return { orders, count }
}

export async function getOrderDetails(orderItemId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  const { data: orderItemData, error } = await supabase
    .from('order_items')
    .select(`
      *,
      orders (
        id,
        order_number,
        status,
        payment_status,
        shipping_address,
        billing_address,
        shipping_method,
        tracking_number,
        notes,
        created_at,
        user_id
      ),
      products (
        id,
        name,
        slug,
        product_images (
          url,
          is_primary
        )
      )
    `)
    .eq('id', orderItemId)
    .eq('seller_id', profile.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItem = orderItemData as any

  // Get customer info
  const { data: customer } = await supabase
    .from('users')
    .select('id, full_name, email, phone')
    .eq('id', orderItem.orders?.user_id)
    .single()

  return {
    order: {
      ...orderItem,
      customer,
    },
  }
}

export async function updateOrderStatus(
  orderItemId: string,
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Verify order item belongs to seller
  const { data: orderItemData } = await supabase
    .from('order_items')
    .select('id, seller_id, order_id')
    .eq('id', orderItemId)
    .single()

  const orderItem = orderItemData as Pick<OrderItem, 'id' | 'seller_id' | 'order_id'> | null

  if (!orderItem || orderItem.seller_id !== profile.id) {
    return { error: 'Order not found' }
  }

  // Update order item status using raw query to bypass TypeScript issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('order_items')
    .update({ status })
    .eq('id', orderItemId)

  if (updateError) {
    return { error: updateError.message }
  }

  // TODO: When implementing full order cancellation/refund logic:
  // If status is 'cancelled' or 'refunded':
  // 1. Fetch order item details (product_id, variant_id, quantity, seller_id, seller_amount)
  // 2. Decrement products.sales_count by item.quantity
  // 3. Restore inventory (increment inventory.quantity or product_variants.stock)
  // 4. Decrement seller_profiles.total_sales and total_revenue
  // 5. Process payment refund via Stripe API (stripe.refunds.create)
  // 6. Update order.payment_status to 'refunded'
  //
  // Example implementation:
  // if (status === 'cancelled') {
  //   const { data: itemDetails } = await supabase.from('order_items')
  //     .select('product_id, variant_id, quantity, seller_id, seller_amount')
  //     .eq('id', orderItemId).single()
  //
  //   // Decrement product sales_count
  //   const { data: product } = await supabase.from('products')
  //     .select('sales_count').eq('id', itemDetails.product_id).single()
  //   await supabase.from('products')
  //     .update({ sales_count: Math.max(0, (product.sales_count || 0) - itemDetails.quantity) })
  //     .eq('id', itemDetails.product_id)
  //
  //   // Restore inventory
  //   const { data: inv } = await supabase.from('inventory')
  //     .select('quantity').eq('variant_id', itemDetails.variant_id).single()
  //   await supabase.from('inventory')
  //     .update({ quantity: (inv.quantity || 0) + itemDetails.quantity })
  //     .eq('variant_id', itemDetails.variant_id)
  //
  //   // Decrement seller stats
  //   const { data: seller } = await supabase.from('seller_profiles')
  //     .select('total_sales, total_revenue').eq('id', itemDetails.seller_id).single()
  //   await supabase.from('seller_profiles')
  //     .update({
  //       total_sales: Math.max(0, (seller.total_sales || 0) - 1),
  //       total_revenue: Math.max(0, (seller.total_revenue || 0) - itemDetails.seller_amount)
  //     })
  //     .eq('id', itemDetails.seller_id)
  // }

  // If shipped, update tracking number on main order
  if (status === 'shipped' && trackingNumber) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({
        tracking_number: trackingNumber,
      })
      .eq('id', orderItem.order_id)
  }

  // Check if all items in order have same status, then update main order
  const { data: allItemsData } = await supabase
    .from('order_items')
    .select('status')
    .eq('order_id', orderItem.order_id)

  const allItems = allItemsData as Pick<OrderItem, 'status'>[] | null
  const allSameStatus = allItems?.every((item) => item.status === status)
  if (allSameStatus) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({ status })
      .eq('id', orderItem.order_id)
  }

  revalidatePath('/seller/orders')
  return { success: true }
}

export async function getOrderStatusCounts() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Get counts for each status
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const counts: Record<string, number> = {}

  for (const status of statuses) {
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', profile.id)
      .eq('status', status)

    counts[status] = count || 0
  }

  return { counts }
}
