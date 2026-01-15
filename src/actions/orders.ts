'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>
type OrderItem = Tables<'order_items'>

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
