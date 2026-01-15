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
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('seller_profiles')
    .update({
      store_name: formData.storeName,
      store_description: formData.storeDescription,
      business_email: formData.businessEmail,
      business_phone: formData.businessPhone,
      store_logo_url: formData.storeLogoUrl,
      store_banner_url: formData.storeBannerUrl,
    })
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
