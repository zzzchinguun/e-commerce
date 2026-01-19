export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAdminDashboardStats, getRecentActivity } from '@/actions/admin'
import { formatPrice } from '@/lib/utils'
import { PendingSellersSection } from '@/components/admin/PendingSellersSection'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDashboardPage() {
  const [statsResult, activityResult] = await Promise.all([
    getAdminDashboardStats(),
    getRecentActivity(5),
  ])

  if ('error' in statsResult && statsResult.error === 'Not authenticated') {
    redirect('/login?redirect=/admin')
  }

  if ('error' in statsResult && statsResult.error === 'Not authorized') {
    redirect('/')
  }

  const stats = 'stats' in statsResult ? statsResult.stats : null
  const activity = 'error' in activityResult ? null : activityResult

  const statCards = [
    {
      title: 'Нийт хэрэглэгчид',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/users',
    },
    {
      title: 'Нийт худалдагчид',
      value: stats?.totalSellers || 0,
      icon: Store,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/sellers',
      badge: stats?.pendingSellers ? `${stats.pendingSellers} хүлээгдэж буй` : null,
    },
    {
      title: 'Нийт бүтээгдэхүүн',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/products',
    },
    {
      title: 'Нийт захиалга',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/admin/orders',
    },
    {
      title: 'Нийт орлого',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/admin/analytics',
    },
    {
      title: 'Платформын комисс',
      value: formatPrice(stats?.totalCommission || 0),
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      href: '/admin/analytics',
    },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Хүлээгдэж буй',
      approved: 'Баталгаажсан',
      rejected: 'Татгалзсан',
      suspended: 'Түдгэлзүүлсэн',
      succeeded: 'Амжилттай',
      failed: 'Амжилтгүй',
      customer: 'Хэрэглэгч',
      seller: 'Худалдагч',
      admin: 'Админ',
    }
    return texts[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.badge && (
                      <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Сүүлийн захиалгууд</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                Бүгдийг харах
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activity?.recentOrders && activity.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {activity.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.users?.full_name || order.users?.email || 'Хэрэглэгч'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(order.grand_total)}</p>
                      <Badge className={getStatusBadge(order.payment_status)}>
                        {getStatusText(order.payment_status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Захиалга байхгүй</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Шинэ хэрэглэгчид</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                Бүгдийг харах
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activity?.recentUsers && activity.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {activity.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.full_name || 'Нэр оруулаагүй'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusBadge(user.role)}>
                        {getStatusText(user.role)}
                      </Badge>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Хэрэглэгч байхгүй</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Seller Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Хүлээгдэж буй худалдагчид
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/sellers?status=pending">
                Бүгдийг харах
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <PendingSellersSection initialSellers={activity?.recentSellers || []} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Түргэн үйлдлүүд</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link href="/admin/sellers?status=pending">
                <Store className="h-6 w-6 text-purple-600" />
                <span>Худалдагч баталгаажуулах</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link href="/admin/products">
                <Package className="h-6 w-6 text-green-600" />
                <span>Бүтээгдэхүүн шалгах</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                <span>Захиалга харах</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <Link href="/admin/settings">
                <TrendingUp className="h-6 w-6 text-pink-600" />
                <span>Тохиргоо</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
