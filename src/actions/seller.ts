'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>

// ============================================
// SELLER PROFILE ACTIONS
// ============================================

export async function getSellerProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message }
  }

  return { profile: profile as SellerProfile | null }
}

export async function registerSeller(formData: {
  storeName: string
  storeDescription: string
  businessEmail: string
  businessPhone?: string
  businessAddress?: {
    address: string
    city: string
    country: string
  }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Generate slug from store name
  const slug = formData.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Create seller profile - cast to any to bypass TypeScript inference issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('seller_profiles')
    .insert({
      user_id: user.id,
      store_name: formData.storeName,
      store_slug: slug,
      store_description: formData.storeDescription,
      business_email: formData.businessEmail,
      business_phone: formData.businessPhone,
      business_address: formData.businessAddress,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have a seller account or store name is taken' }
    }
    return { error: error.message }
  }

  // Update user role to seller
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('users')
    .update({ role: 'seller' })
    .eq('id', user.id)

  revalidatePath('/seller')
  return { profile: profile as SellerProfile }
}

export async function updateSellerProfile(formData: {
  storeName?: string
  storeDescription?: string
  businessEmail?: string
  businessPhone?: string
  storeLogoUrl?: string
  storeBannerUrl?: string
  businessAddress?: {
    address: string
    city: string
    country: string
  }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Build update object with only defined fields
  const updateData: Record<string, unknown> = {}
  if (formData.storeName !== undefined) updateData.store_name = formData.storeName
  if (formData.storeDescription !== undefined) updateData.store_description = formData.storeDescription
  if (formData.businessEmail !== undefined) updateData.business_email = formData.businessEmail
  if (formData.businessPhone !== undefined) updateData.business_phone = formData.businessPhone
  if (formData.storeLogoUrl !== undefined) updateData.store_logo_url = formData.storeLogoUrl
  if (formData.storeBannerUrl !== undefined) updateData.store_banner_url = formData.storeBannerUrl
  if (formData.businessAddress !== undefined) updateData.business_address = formData.businessAddress

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('seller_profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/seller/settings')
  return { profile: profile as SellerProfile }
}

// ============================================
// SELLER DASHBOARD STATS
// ============================================

export async function getSellerPendingOrderCount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { count: 0 }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as { id: string } | null

  if (!profile) {
    return { count: 0 }
  }

  // Get pending orders count
  const { count } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.id)
    .eq('status', 'pending')

  return { count: count || 0 }
}

export async function getSellerDashboardStats() {
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
    .select('id, total_revenue, total_sales')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id' | 'total_revenue' | 'total_sales'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Get product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.id)

  // Get pending orders count
  const { count: pendingOrders } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.id)
    .eq('status', 'pending')

  return {
    stats: {
      revenue: profile.total_revenue || 0,
      totalSales: profile.total_sales || 0,
      productCount: productCount || 0,
      pendingOrders: pendingOrders || 0,
      totalViews: 0,
    },
  }
}

export async function getSellerRecentOrders(limit = 5) {
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

  // Get recent order items for this seller
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select(`
      *,
      orders (
        id,
        order_number,
        status,
        created_at
      ),
      products (
        name
      )
    `)
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { orders: orderItems }
}

// ============================================
// SELLER EARNINGS ACTIONS
// ============================================

export async function getSellerEarningsStats() {
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
    .select('id, total_revenue, total_sales, commission_rate')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id' | 'total_revenue' | 'total_sales' | 'commission_rate'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Get earnings from completed orders (seller_amount is net after commission)
  const { data: completedOrders } = await supabase
    .from('order_items')
    .select('seller_amount, status, created_at')
    .eq('seller_id', profile.id)
    .in('status', ['delivered', 'shipped', 'processing'])

  const orders = (completedOrders || []) as Array<{
    seller_amount: number
    status: string
    created_at: string
  }>

  // Calculate available balance (delivered orders)
  const availableBalance = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.seller_amount || 0), 0)

  // Calculate pending balance (shipped + processing orders)
  const pendingBalance = orders
    .filter((o) => o.status === 'shipped' || o.status === 'processing')
    .reduce((sum, o) => sum + Number(o.seller_amount || 0), 0)

  // Calculate this month's earnings
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const thisMonthEarnings = orders
    .filter((o) => new Date(o.created_at) >= startOfMonth)
    .reduce((sum, o) => sum + Number(o.seller_amount || 0), 0)

  // Calculate last month's earnings for comparison
  const startOfLastMonth = new Date()
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
  startOfLastMonth.setDate(1)
  startOfLastMonth.setHours(0, 0, 0, 0)

  const endOfLastMonth = new Date()
  endOfLastMonth.setDate(0)
  endOfLastMonth.setHours(23, 59, 59, 999)

  const lastMonthEarnings = orders
    .filter((o) => {
      const date = new Date(o.created_at)
      return date >= startOfLastMonth && date <= endOfLastMonth
    })
    .reduce((sum, o) => sum + Number(o.seller_amount || 0), 0)

  // Calculate month-over-month change percentage
  const monthChange = lastMonthEarnings > 0
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
    : thisMonthEarnings > 0 ? 100 : 0

  // Total earned is from seller_profiles
  const totalEarned = Number(profile.total_revenue || 0)

  return {
    stats: {
      availableBalance,
      pendingBalance,
      totalEarned,
      thisMonth: thisMonthEarnings,
      monthChange: Math.round(monthChange * 10) / 10, // Round to 1 decimal
      commissionRate: Number(profile.commission_rate || 10),
    },
  }
}

export async function getSellerTransactions(limit = 10) {
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

  // Get recent transactions (order items)
  const { data: transactions, error } = await supabase
    .from('order_items')
    .select(`
      id,
      product_name,
      total,
      commission_amount,
      seller_amount,
      status,
      created_at,
      orders (
        order_number
      )
    `)
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  // Transform to transaction format
  const formattedTransactions = (transactions || []).map((txn: any) => ({
    id: txn.id,
    type: 'sale' as const,
    description: `Захиалга #${txn.orders?.order_number || 'N/A'}`,
    productName: txn.product_name,
    amount: Number(txn.total || 0),
    fee: Number(txn.commission_amount || 0),
    net: Number(txn.seller_amount || 0),
    status: txn.status,
    date: new Date(txn.created_at),
  }))

  return { transactions: formattedTransactions }
}

// ============================================
// PUBLIC SELLER STOREFRONT ACTIONS
// ============================================

export async function getSellerBySlug(slug: string) {
  const supabase = await createClient()

  const { data: seller, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('store_slug', slug)
    .eq('status', 'approved')
    .single()

  if (error) {
    return { error: error.code === 'PGRST116' ? 'Seller not found' : error.message }
  }

  return { seller: seller as SellerProfile }
}

export async function getSellerProducts(sellerId: string, options?: {
  page?: number
  limit?: number
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular'
}) {
  const supabase = await createClient()
  const page = options?.page || 1
  const limit = options?.limit || 12
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      compare_at_price,
      status,
      created_at,
      product_images (
        url,
        alt_text,
        is_primary
      )
    `, { count: 'exact' })
    .eq('seller_id', sellerId)
    .eq('status', 'active')

  // Apply sorting
  switch (options?.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('created_at', { ascending: false }) // TODO: sort by sales
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data: products, error, count } = await query

  if (error) {
    return { error: error.message, products: [], total: 0 }
  }

  // Transform products to match expected format
  const transformedProducts = (products || []).map((product: any) => {
    const primaryImage = product.product_images?.find((img: any) => img.is_primary)
    const firstImage = product.product_images?.[0]

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
      image: primaryImage?.url || firstImage?.url || '/placeholder-product.jpg',
      status: product.status,
      createdAt: product.created_at,
    }
  })

  return {
    products: transformedProducts,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
