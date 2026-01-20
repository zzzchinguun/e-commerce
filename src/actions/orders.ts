'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables, Database } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>
type OrderItem = Tables<'order_items'>
type OrderStatus = Database['public']['Enums']['order_status']

// ============================================
// CUSTOMER ORDER ACTIONS
// ============================================

export async function getUserOrders(options?: {
  status?: OrderStatus | 'all'
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
  status?: OrderStatus | 'all'
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

  // Verify order item belongs to seller and get order details for notification
  const { data: orderItemData } = await supabase
    .from('order_items')
    .select(`
      id, seller_id, order_id, product_name,
      orders!inner(user_id, order_number)
    `)
    .eq('id', orderItemId)
    .single()

  const orderItem = orderItemData as {
    id: string
    seller_id: string
    order_id: string
    product_name: string
    orders: { user_id: string; order_number: string }
  } | null

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

  // Handle cancellation: restore inventory, decrement stats
  if (status === 'cancelled') {
    const cancellationResult = await handleOrderItemCancellation(supabase, orderItemId)
    if (cancellationResult.error) {
      console.error('Cancellation side effects failed:', cancellationResult.error)
      // Don't fail the whole operation - status is already updated
    }
  }

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

  // Send notification to customer about status change
  try {
    const notificationMessages: Record<string, { type: string; title: string; message: string }> = {
      processing: {
        type: 'order_placed',
        title: 'Захиалга боловсруулагдаж байна',
        message: `Таны #${orderItem.orders.order_number} захиалгын "${orderItem.product_name}" бүтээгдэхүүн боловсруулагдаж байна.`,
      },
      shipped: {
        type: 'order_shipped',
        title: 'Захиалга илгээгдлээ',
        message: `Таны #${orderItem.orders.order_number} захиалгын "${orderItem.product_name}" бүтээгдэхүүн илгээгдлээ.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      },
      delivered: {
        type: 'order_delivered',
        title: 'Захиалга хүргэгдлээ',
        message: `Таны #${orderItem.orders.order_number} захиалгын "${orderItem.product_name}" бүтээгдэхүүн хүргэгдлээ.`,
      },
      cancelled: {
        type: 'order_placed',
        title: 'Захиалга цуцлагдлаа',
        message: `Таны #${orderItem.orders.order_number} захиалгын "${orderItem.product_name}" бүтээгдэхүүн цуцлагдлаа.`,
      },
    }

    const notif = notificationMessages[status]
    if (notif && orderItem.orders.user_id) {
      await (supabase as any)
        .from('notifications')
        .insert({
          user_id: orderItem.orders.user_id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          data: {
            orderId: orderItem.order_id,
            orderNumber: orderItem.orders.order_number,
            orderItemId,
            status,
          },
        })
    }
  } catch (e) {
    // Log but don't fail the status update
    console.error('Failed to send order status notification:', e)
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

  // Get all order items for this seller and aggregate counts by status in one query
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('status')
    .eq('seller_id', profile.id)

  // Aggregate counts by status
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const counts: Record<string, number> = {}

  // Initialize all statuses to 0
  for (const status of statuses) {
    counts[status] = 0
  }

  // Count items by status
  const items = (orderItems || []) as { status: string }[]
  for (const item of items) {
    if (item.status && counts.hasOwnProperty(item.status)) {
      counts[item.status]++
    }
  }

  return { counts }
}

// ============================================
// ORDER CANCELLATION HELPER
// ============================================

/**
 * Handle side effects of order item cancellation:
 * - Restore inventory
 * - Decrement product sales_count
 * - Decrement seller stats
 */
async function handleOrderItemCancellation(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  orderItemId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Fetch order item details
    const { data: itemData, error: itemError } = await supabase
      .from('order_items')
      .select('product_id, variant_id, quantity, seller_id, seller_amount')
      .eq('id', orderItemId)
      .single()

    if (itemError || !itemData) {
      return { error: 'Failed to fetch order item details' }
    }

    const item = itemData as {
      product_id: string
      variant_id: string
      quantity: number
      seller_id: string
      seller_amount: number
    }

    // 1. Restore inventory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invData } = await (supabase as any)
      .from('inventory')
      .select('id, quantity')
      .eq('variant_id', item.variant_id)
      .single()

    if (invData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('inventory')
        .update({ quantity: (invData.quantity || 0) + item.quantity })
        .eq('id', invData.id)
    }

    // 2. Decrement product sales_count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: productData } = await (supabase as any)
      .from('products')
      .select('sales_count')
      .eq('id', item.product_id)
      .single()

    if (productData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('products')
        .update({
          sales_count: Math.max(0, (productData.sales_count || 0) - item.quantity),
        })
        .eq('id', item.product_id)
    }

    // 3. Decrement seller stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sellerData } = await (supabase as any)
      .from('seller_profiles')
      .select('total_sales, total_revenue')
      .eq('id', item.seller_id)
      .single()

    if (sellerData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('seller_profiles')
        .update({
          total_sales: Math.max(0, (sellerData.total_sales || 0) - 1),
          total_revenue: Math.max(0, (sellerData.total_revenue || 0) - item.seller_amount),
        })
        .eq('id', item.seller_id)
    }

    return { success: true }
  } catch (error) {
    console.error('Order item cancellation error:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
