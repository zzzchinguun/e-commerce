'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// ============================================
// TYPES
// ============================================

interface FilterOptions {
  search?: string
  role?: 'customer' | 'seller' | 'admin'
  status?: string
  page?: number
  limit?: number
}

interface SellerFilterOptions extends FilterOptions {
  status?: 'pending' | 'approved' | 'suspended' | 'rejected'
}

interface ProductFilterOptions extends FilterOptions {
  category?: string
  seller?: string
  featured?: boolean
  productStatus?: 'draft' | 'active' | 'inactive' | 'out_of_stock'
}

interface OrderFilterOptions extends FilterOptions {
  orderStatus?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
}

// ============================================
// ADMIN VERIFICATION
// ============================================

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userProfile = profile as { role: string } | null
  if (!userProfile || userProfile.role !== 'admin') {
    throw new Error('Not authorized')
  }

  return { user, supabase }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getAdminDashboardStats() {
  try {
    const { supabase } = await verifyAdmin()

    // Get total users count
    const { count: totalUsers } = await (supabase as any)
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total sellers count
    const { count: totalSellers } = await (supabase as any)
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    // Get pending sellers count
    const { count: pendingSellers } = await (supabase as any)
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total products count
    const { count: totalProducts } = await (supabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total orders count
    const { count: totalOrders } = await (supabase as any)
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get total revenue
    const { data: revenueData } = await (supabase as any)
      .from('orders')
      .select('grand_total')
      .eq('payment_status', 'succeeded')

    const revenueArr = revenueData as { grand_total: number }[] | null
    const totalRevenue = revenueArr?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

    // Get platform commission
    const { data: commissionData } = await (supabase as any)
      .from('order_items')
      .select('commission_amount')

    const commissionArr = commissionData as { commission_amount: number }[] | null
    const totalCommission = commissionArr?.reduce((sum, item) => sum + (item.commission_amount || 0), 0) || 0

    return {
      stats: {
        totalUsers: totalUsers || 0,
        totalSellers: totalSellers || 0,
        pendingSellers: pendingSellers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalCommission
      }
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch stats' }
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const { supabase } = await verifyAdmin()

    // Get recent orders
    const { data: recentOrders } = await (supabase as any)
      .from('orders')
      .select(`
        id,
        order_number,
        grand_total,
        payment_status,
        created_at,
        users:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent users
    const { data: recentUsers } = await (supabase as any)
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent seller applications
    const { data: recentSellers } = await (supabase as any)
      .from('seller_profiles')
      .select(`
        id,
        store_name,
        status,
        created_at,
        users:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      recentOrders: recentOrders || [],
      recentUsers: recentUsers || [],
      recentSellers: recentSellers || []
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch activity' }
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers(options: FilterOptions = {}) {
  try {
    const { supabase } = await verifyAdmin()
    const { search, role, status, page = 1, limit = 20 } = options

    let query = supabase
      .from('users')
      .select(`
        *,
        seller_profiles (id, store_name, status)
      `, { count: 'exact' })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { users: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch users' }
  }
}

export async function getUserById(userId: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: user, error } = await (supabase as any)
      .from('users')
      .select(`
        *,
        seller_profiles (*),
        orders (
          id,
          order_number,
          grand_total,
          status,
          payment_status,
          created_at
        )
      `)
      .eq('id', userId)
      .single()

    if (error) throw error

    return { user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch user' }
  }
}

export async function updateUserRole(userId: string, role: 'customer' | 'seller' | 'admin') {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_user_role',
      p_target_user_id: userId,
      p_metadata: { new_role: role }
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update role' }
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: isActive ? 'activate_user' : 'deactivate_user',
      p_target_user_id: userId
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

// ============================================
// IMPERSONATION
// ============================================

const IMPERSONATION_COOKIE = 'admin_impersonation'

export async function startImpersonation(targetUserId: string) {
  try {
    const { user, supabase } = await verifyAdmin()

    // Verify target user exists and is not admin
    const { data: targetUser, error } = await (supabase as any)
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', targetUserId)
      .single()

    if (error || !targetUser) {
      return { error: 'Хэрэглэгч олдсонгүй' }
    }

    if (targetUser.role === 'admin') {
      return { error: 'Админ хэрэглэгчийг дууриах боломжгүй' }
    }

    // Set impersonation cookie
    const cookieStore = await cookies()
    const impersonationData = {
      adminId: user.id,
      impersonatedUserId: targetUserId,
      impersonatedUserEmail: targetUser.email,
      impersonatedUserName: targetUser.full_name,
      startedAt: new Date().toISOString()
    }

    cookieStore.set(IMPERSONATION_COOKIE, JSON.stringify(impersonationData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours max
    })

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'impersonation_start',
      p_target_user_id: targetUserId,
      p_metadata: { target_email: targetUser.email }
    })

    return { success: true, redirectTo: '/' }
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return { error: error instanceof Error ? error.message : 'Failed to start impersonation' }
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE)

    if (impersonationCookie) {
      const impersonationData = JSON.parse(impersonationCookie.value)

      // Log the end of impersonation
      if (user) {
        await (supabase as any).rpc('log_admin_action', {
          p_action: 'impersonation_end',
          p_target_user_id: impersonationData.impersonatedUserId
        })
      }
    }

    // Clear the cookie
    cookieStore.delete(IMPERSONATION_COOKIE)

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error stopping impersonation:', error)
    return { error: error instanceof Error ? error.message : 'Failed to stop impersonation' }
  }
}

export async function getImpersonationStatus() {
  try {
    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE)

    if (!impersonationCookie) {
      return { isImpersonating: false }
    }

    const data = JSON.parse(impersonationCookie.value)
    return {
      isImpersonating: true,
      impersonatedUser: {
        id: data.impersonatedUserId,
        email: data.impersonatedUserEmail,
        name: data.impersonatedUserName
      }
    }
  } catch {
    return { isImpersonating: false }
  }
}

// ============================================
// SELLER MANAGEMENT
// ============================================

export async function getAllSellers(options: SellerFilterOptions = {}) {
  try {
    const { supabase } = await verifyAdmin()
    const { search, status, page = 1, limit = 20 } = options

    let query = supabase
      .from('seller_profiles')
      .select(`
        *,
        users:user_id (id, full_name, email, avatar_url)
      `, { count: 'exact' })

    if (search) {
      query = query.or(`store_name.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { sellers: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch sellers' }
  }
}

export async function getSellerById(sellerId: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: seller, error } = await (supabase as any)
      .from('seller_profiles')
      .select(`
        *,
        users:user_id (*)
      `)
      .eq('id', sellerId)
      .single()

    if (error) throw error

    // Get seller's products count
    const { count: productCount } = await (supabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)

    // Get seller's order items
    const { data: orderItems } = await (supabase as any)
      .from('order_items')
      .select('seller_amount, commission_amount')
      .eq('seller_id', sellerId)

    const totalEarnings = orderItems?.reduce((sum: number, item: any) => sum + (item.seller_amount || 0), 0) || 0
    const totalCommission = orderItems?.reduce((sum: number, item: any) => sum + (item.commission_amount || 0), 0) || 0

    return {
      seller: {
        ...seller,
        productCount: productCount || 0,
        totalEarnings,
        totalCommission
      }
    }
  } catch (error) {
    console.error('Error fetching seller:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch seller' }
  }
}

export async function updateSellerStatus(sellerId: string, status: 'approved' | 'rejected' | 'suspended') {
  try {
    const { supabase } = await verifyAdmin()

    // Get seller's user_id first
    const { data: seller } = await (supabase as any)
      .from('seller_profiles')
      .select('user_id')
      .eq('id', sellerId)
      .single()

    const { error } = await (supabase as any)
      .from('seller_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sellerId)

    if (error) throw error

    // If approving, update user role to seller
    if (status === 'approved' && seller?.user_id) {
      await (supabase as any)
        .from('users')
        .update({ role: 'seller' })
        .eq('id', seller.user_id)
    }

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: `seller_${status}`,
      p_target_entity_type: 'seller',
      p_target_entity_id: sellerId,
      p_target_user_id: seller?.user_id
    })

    revalidatePath('/admin/sellers')
    return { success: true }
  } catch (error) {
    console.error('Error updating seller status:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

export async function updateCommissionRate(sellerId: string, rate: number) {
  try {
    const { supabase } = await verifyAdmin()

    if (rate < 0 || rate > 100) {
      return { error: 'Комиссийн хувь 0-100 хооронд байх ёстой' }
    }

    const { error } = await (supabase as any)
      .from('seller_profiles')
      .update({ commission_rate: rate, updated_at: new Date().toISOString() })
      .eq('id', sellerId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_commission_rate',
      p_target_entity_type: 'seller',
      p_target_entity_id: sellerId,
      p_metadata: { new_rate: rate }
    })

    revalidatePath('/admin/sellers')
    return { success: true }
  } catch (error) {
    console.error('Error updating commission rate:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update commission' }
  }
}

export async function getPendingSellerCount() {
  try {
    const { supabase } = await verifyAdmin()

    const { count } = await (supabase as any)
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return { count: count || 0 }
  } catch (error) {
    return { count: 0 }
  }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export async function getAllProducts(options: ProductFilterOptions = {}) {
  try {
    const { supabase } = await verifyAdmin()
    const { search, category, seller, featured, productStatus, page = 1, limit = 20 } = options

    let query = supabase
      .from('products')
      .select(`
        *,
        seller_profiles:seller_id (id, store_name),
        categories:category_id (id, name, slug)
      `, { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (seller) {
      query = query.eq('seller_id', seller)
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    if (productStatus) {
      query = query.eq('status', productStatus)
    }

    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { products: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch products' }
  }
}

export async function updateProductStatus(productId: string, status: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_product_status',
      p_target_entity_type: 'product',
      p_target_entity_id: productId,
      p_metadata: { new_status: status }
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error updating product status:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

export async function toggleProductFeatured(productId: string, featured: boolean) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('products')
      .update({ is_featured: featured, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: featured ? 'feature_product' : 'unfeature_product',
      p_target_entity_type: 'product',
      p_target_entity_id: productId
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error toggling product featured:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update featured status' }
  }
}

export async function deleteProductAsAdmin(productId: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('products')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'delete_product',
      p_target_entity_type: 'product',
      p_target_entity_id: productId
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error: error instanceof Error ? error.message : 'Failed to delete product' }
  }
}

export async function bulkUpdateProducts(productIds: string[], updates: { status?: string; is_featured?: boolean }) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', productIds)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'bulk_update_products',
      p_metadata: { product_count: productIds.length, updates }
    })

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error bulk updating products:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update products' }
  }
}

// ============================================
// ORDER MANAGEMENT
// ============================================

export async function getAllOrders(options: OrderFilterOptions = {}) {
  try {
    const { supabase } = await verifyAdmin()
    const { search, orderStatus, sellerId, dateFrom, dateTo, page = 1, limit = 20 } = options

    let query = supabase
      .from('orders')
      .select(`
        *,
        users:user_id (id, full_name, email)
      `, { count: 'exact' })

    if (search) {
      query = query.ilike('order_number', `%${search}%`)
    }

    if (orderStatus) {
      query = query.eq('status', orderStatus)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { orders: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch orders' }
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: order, error } = await (supabase as any)
      .from('orders')
      .select(`
        *,
        users:user_id (*),
        order_items (
          *,
          products:product_id (name, slug, images),
          seller_profiles:seller_id (store_name)
        ),
        payments (*)
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    return { order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch order' }
  }
}

export async function updateOrderStatusAsAdmin(orderId: string, status: string) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_order_status',
      p_target_entity_type: 'order',
      p_target_entity_id: orderId,
      p_metadata: { new_status: status }
    })

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

export async function getOrderStatusCounts() {
  try {
    const { supabase } = await verifyAdmin()

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    const counts: Record<string, number> = {}

    for (const status of statuses) {
      const { count } = await (supabase as any)
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)

      counts[status] = count || 0
    }

    return { counts }
  } catch (error) {
    console.error('Error fetching order counts:', error)
    return { counts: {} }
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getPlatformAnalytics(period: string = '30d') {
  try {
    const { supabase } = await verifyAdmin()

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Get orders in period
    const { data: orders } = await (supabase as any)
      .from('orders')
      .select('grand_total, payment_status')
      .gte('created_at', startDateStr)
      .eq('payment_status', 'succeeded')

    const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0) || 0
    const orderCount = orders?.length || 0
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

    // Get new users in period
    const { count: newUsers } = await (supabase as any)
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr)

    // Get product views in period
    const { count: totalViews } = await (supabase as any)
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', startDateStr)

    return {
      stats: {
        totalRevenue,
        orderCount,
        avgOrderValue,
        newUsers: newUsers || 0,
        totalViews: totalViews || 0,
        conversionRate: totalViews && totalViews > 0 ? ((orderCount / totalViews) * 100).toFixed(2) : '0'
      }
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch analytics' }
  }
}

export async function getTopSellers(period: string = '30d', limit: number = 10) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: sellers } = await (supabase as any)
      .from('seller_profiles')
      .select(`
        id,
        store_name,
        total_revenue,
        total_sales,
        rating_average
      `)
      .eq('status', 'approved')
      .order('total_revenue', { ascending: false })
      .limit(limit)

    return { sellers: sellers || [] }
  } catch (error) {
    console.error('Error fetching top sellers:', error)
    return { sellers: [] }
  }
}

export async function getTopProducts(period: string = '30d', limit: number = 10) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: products } = await (supabase as any)
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        sale_count,
        view_count,
        rating_average,
        seller_profiles:seller_id (store_name)
      `)
      .eq('status', 'active')
      .order('sale_count', { ascending: false })
      .limit(limit)

    return { products: products || [] }
  } catch (error) {
    console.error('Error fetching top products:', error)
    return { products: [] }
  }
}

// ============================================
// SETTINGS & CATEGORIES
// ============================================

export async function getPlatformSettings() {
  try {
    const { supabase } = await verifyAdmin()

    const { data: settings, error } = await (supabase as any)
      .from('platform_settings')
      .select('*')

    if (error) throw error

    // Convert to key-value object
    const settingsMap: Record<string, any> = {}
    settings?.forEach((s: any) => {
      settingsMap[s.key] = s.value
    })

    return { settings: settingsMap }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch settings' }
  }
}

export async function updatePlatformSetting(key: string, value: any) {
  try {
    const { supabase, user } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('platform_settings')
      .update({
        value,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_platform_setting',
      p_metadata: { key, new_value: value }
    })

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating setting:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update setting' }
  }
}

export async function getAllCategories() {
  try {
    const { supabase } = await verifyAdmin()

    const { data: categories, error } = await (supabase as any)
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error

    return { categories: categories || [] }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch categories' }
  }
}

export async function createCategory(data: { name: string; slug: string; description?: string; parent_id?: string; image_url?: string }) {
  try {
    const { supabase } = await verifyAdmin()

    const { data: category, error } = await (supabase as any)
      .from('categories')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'create_category',
      p_target_entity_type: 'category',
      p_target_entity_id: category.id,
      p_metadata: { name: data.name }
    })

    revalidatePath('/admin/settings')
    return { category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create category' }
  }
}

export async function updateCategory(categoryId: string, data: { name?: string; slug?: string; description?: string; image_url?: string }) {
  try {
    const { supabase } = await verifyAdmin()

    const { error } = await (supabase as any)
      .from('categories')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', categoryId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'update_category',
      p_target_entity_type: 'category',
      p_target_entity_id: categoryId
    })

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update category' }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const { supabase } = await verifyAdmin()

    // Check if category has products
    const { count } = await (supabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    if (count && count > 0) {
      return { error: 'Энэ ангилалд бүтээгдэхүүн байгаа тул устгах боломжгүй' }
    }

    const { error } = await (supabase as any)
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error

    // Log the action
    await (supabase as any).rpc('log_admin_action', {
      p_action: 'delete_category',
      p_target_entity_type: 'category',
      p_target_entity_id: categoryId
    })

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error: error instanceof Error ? error.message : 'Failed to delete category' }
  }
}
