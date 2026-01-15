'use server'

import { createClient } from '@/lib/supabase/server'

interface AnalyticsStats {
  totalRevenue: number
  revenueChange: number
  orderCount: number
  orderChange: number
  productViews: number
  viewsChange: number
  conversionRate: number
  conversionChange: number
}

interface TopProduct {
  id: string
  name: string
  views: number
  sales: number
  revenue: number
}

interface RecentActivity {
  type: 'sale' | 'view' | 'review' | 'stock'
  message: string
  time: string
  amount?: number
}

// Helper to calculate period dates
function getPeriodDates(period: string): { current: Date; previous: Date } {
  const now = new Date()
  let daysBack = 7

  switch (period) {
    case '24h':
      daysBack = 1
      break
    case '7d':
      daysBack = 7
      break
    case '30d':
      daysBack = 30
      break
    case '90d':
      daysBack = 90
      break
  }

  const current = new Date(now)
  current.setDate(current.getDate() - daysBack)

  const previous = new Date(current)
  previous.setDate(previous.getDate() - daysBack)

  return { current, previous }
}

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export async function getSellerAnalytics(period: string = '7d'): Promise<{
  stats: AnalyticsStats
  topProducts: TopProduct[]
  recentActivity: RecentActivity[]
} | null> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get seller profile
  const { data: sellerData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!sellerData) return null

  const seller = sellerData as { id: string }

  const { current: periodStart, previous: previousStart } = getPeriodDates(period)
  const now = new Date()

  // ============================================
  // CURRENT PERIOD STATS
  // ============================================

  // Revenue and order count for current period
  const { data: currentOrders } = await supabase
    .from('order_items')
    .select(`
      total,
      seller_amount,
      order_id,
      orders!inner(created_at, payment_status)
    `)
    .eq('seller_id', seller.id)
    .gte('orders.created_at', periodStart.toISOString())
    .eq('orders.payment_status', 'succeeded') as any

  const currentRevenue = currentOrders?.reduce((sum: number, item: any) => sum + Number(item.seller_amount || 0), 0) || 0
  const currentOrderIds = new Set(currentOrders?.map((item: any) => item.order_id) || [])
  const currentOrderCount = currentOrderIds.size

  // Product views for current period
  const { data: sellerProductsData } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', seller.id)

  const sellerProducts = (sellerProductsData || []) as { id: string }[]
  const productIds = sellerProducts.map(p => p.id)

  let currentViews = 0
  if (productIds.length > 0) {
    const { count } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .in('product_id', productIds)
      .gte('created_at', periodStart.toISOString())

    currentViews = count || 0
  }

  // ============================================
  // PREVIOUS PERIOD STATS (for comparison)
  // ============================================

  const { data: previousOrders } = await supabase
    .from('order_items')
    .select(`
      total,
      seller_amount,
      order_id,
      orders!inner(created_at, payment_status)
    `)
    .eq('seller_id', seller.id)
    .gte('orders.created_at', previousStart.toISOString())
    .lt('orders.created_at', periodStart.toISOString())
    .eq('orders.payment_status', 'succeeded') as any

  const previousRevenue = previousOrders?.reduce((sum: number, item: any) => sum + Number(item.seller_amount || 0), 0) || 0
  const previousOrderIds = new Set(previousOrders?.map((item: any) => item.order_id) || [])
  const previousOrderCount = previousOrderIds.size

  let previousViews = 0
  if (productIds.length > 0) {
    const { count } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .in('product_id', productIds)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', periodStart.toISOString())

    previousViews = count || 0
  }

  // Calculate conversion rates
  const currentConversion = currentViews > 0 ? (currentOrderCount / currentViews) * 100 : 0
  const previousConversion = previousViews > 0 ? (previousOrderCount / previousViews) * 100 : 0

  // ============================================
  // TOP PRODUCTS
  // ============================================

  const { data: topProductsRaw } = await supabase
    .from('products')
    .select(`
      id,
      name,
      view_count,
      sales_count
    `)
    .eq('seller_id', seller.id)
    .eq('status', 'active')
    .order('sales_count', { ascending: false })
    .limit(5)

  const topProductsData = (topProductsRaw || []) as {
    id: string
    name: string
    view_count: number | null
    sales_count: number | null
  }[]

  // Get revenue per product from order_items
  const topProducts: TopProduct[] = []

  for (const product of topProductsData) {
    const { data: productRevenueRaw } = await supabase
      .from('order_items')
      .select('seller_amount')
      .eq('product_id', product.id)

    const productRevenue = (productRevenueRaw || []) as { seller_amount: number | null }[]
    const revenue = productRevenue.reduce((sum, item) => sum + Number(item.seller_amount || 0), 0)

    topProducts.push({
      id: product.id,
      name: product.name,
      views: product.view_count || 0,
      sales: product.sales_count || 0,
      revenue,
    })
  }

  // ============================================
  // RECENT ACTIVITY
  // ============================================

  const recentActivity: RecentActivity[] = []

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('order_items')
    .select(`
      seller_amount,
      orders!inner(order_number, created_at)
    `)
    .eq('seller_id', seller.id)
    .order('orders(created_at)', { ascending: false })
    .limit(3) as any

  recentOrders?.forEach((item: any) => {
    recentActivity.push({
      type: 'sale',
      message: `New order ${item.orders.order_number} placed`,
      time: formatRelativeTime(new Date(item.orders.created_at)),
      amount: Number(item.seller_amount),
    })
  })

  // Recent reviews
  if (productIds.length > 0) {
    const { data: recentReviews } = await supabase
      .from('product_reviews')
      .select(`
        rating,
        created_at,
        products!inner(name)
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false })
      .limit(2) as any

    recentReviews?.forEach((review: any) => {
      recentActivity.push({
        type: 'review',
        message: `New ${review.rating}-star review on ${review.products.name}`,
        time: formatRelativeTime(new Date(review.created_at)),
      })
    })
  }

  // Low stock alerts
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select(`
      name,
      product_variants!inner(
        inventory!inner(quantity, low_stock_threshold)
      )
    `)
    .eq('seller_id', seller.id)
    .eq('status', 'active')
    .limit(5) as any

  lowStockProducts?.forEach((product: any) => {
    const variant = product.product_variants?.[0]
    const inventory = variant?.inventory
    if (inventory && inventory.quantity <= inventory.low_stock_threshold) {
      recentActivity.push({
        type: 'stock',
        message: `${product.name} running low (${inventory.quantity} left)`,
        time: 'Now',
      })
    }
  })

  // Sort by most recent and limit
  recentActivity.sort((a, b) => {
    if (a.time === 'Now') return -1
    if (b.time === 'Now') return 1
    return 0
  })

  return {
    stats: {
      totalRevenue: currentRevenue,
      revenueChange: calculateChange(currentRevenue, previousRevenue),
      orderCount: currentOrderCount,
      orderChange: calculateChange(currentOrderCount, previousOrderCount),
      productViews: currentViews,
      viewsChange: calculateChange(currentViews, previousViews),
      conversionRate: Math.round(currentConversion * 100) / 100,
      conversionChange: calculateChange(currentConversion, previousConversion),
    },
    topProducts: topProducts.slice(0, 5),
    recentActivity: recentActivity.slice(0, 5),
  }
}
