import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Eye,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import { getSellerDashboardStats, getSellerRecentOrders, getSellerProfile } from '@/actions/seller'
import { redirect } from 'next/navigation'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
}

export default async function SellerDashboard() {
  // Check if user has a seller profile
  const { profile, error: profileError } = await getSellerProfile()

  if (profileError === 'Not authenticated') {
    redirect('/login?redirect=/seller')
  }

  if (!profile) {
    redirect('/seller/register')
  }

  if (profile.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-yellow-100 p-4">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Account Pending Approval</h2>
        <p className="mt-2 text-center text-gray-500 max-w-md">
          Your seller account is currently under review. You&apos;ll be notified once it&apos;s approved.
        </p>
      </div>
    )
  }

  if (profile.status === 'suspended') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-4">
          <Package className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Account Suspended</h2>
        <p className="mt-2 text-center text-gray-500 max-w-md">
          Your seller account has been suspended. Please contact support for more information.
        </p>
      </div>
    )
  }

  // Fetch dashboard data
  const [statsResult, ordersResult] = await Promise.all([
    getSellerDashboardStats(),
    getSellerRecentOrders(5),
  ])

  const stats = statsResult.stats || {
    revenue: 0,
    totalSales: 0,
    productCount: 0,
    pendingOrders: 0,
    totalViews: 0,
  }

  const recentOrders = ordersResult.orders || []

  const statCards = [
    {
      name: 'Total Revenue',
      value: formatPrice(stats.revenue),
      icon: DollarSign,
    },
    {
      name: 'Total Sales',
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
    },
    {
      name: 'Products',
      value: stats.productCount.toString(),
      icon: Package,
    },
    {
      name: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {profile.store_name}!</h1>
        <p className="mt-1 text-orange-100">
          Here&apos;s what&apos;s happening with your store today.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            asChild
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            <Link href="/seller/products/new">Add New Product</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Link href="/seller/orders">View Orders</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-orange-100 p-2">
                  <stat.icon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: {
                  id: string
                  orders: { order_number: string; created_at: string } | null
                  products: { name: string } | null
                  status: string
                  total: number
                }) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {order.orders?.order_number || 'N/A'}
                        </span>
                        <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-700'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.products?.name || 'Unknown product'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(order.total || 0)}
                      </p>
                      <p className="flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {order.orders?.created_at
                          ? new Date(order.orders.created_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/seller/products/new">
                  <Package className="h-6 w-6 text-orange-500" />
                  <span>Add Product</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/seller/orders">
                  <ShoppingCart className="h-6 w-6 text-orange-500" />
                  <span>Manage Orders</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/seller/analytics">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  <span>View Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/seller/settings">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                  <span>Payout Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
