'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Eye,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice } from '@/lib/utils/format'
import { getSellerAnalytics } from '@/actions/analytics'

interface AnalyticsData {
  stats: {
    totalRevenue: number
    revenueChange: number
    orderCount: number
    orderChange: number
    productViews: number
    viewsChange: number
    conversionRate: number
    conversionChange: number
  }
  topProducts: {
    id: string
    name: string
    views: number
    sales: number
    revenue: number
  }[]
  recentActivity: {
    type: 'sale' | 'view' | 'review' | 'stock'
    message: string
    time: string
    amount?: number
  }[]
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const result = await getSellerAnalytics(period)
      setData(result)
      setLoading(false)
    }
    fetchData()
  }, [period])

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatPrice(value)
      case 'percent':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const stats = data
    ? [
        {
          title: 'Total Revenue',
          value: data.stats.totalRevenue,
          change: data.stats.revenueChange,
          icon: DollarSign,
          format: 'currency',
        },
        {
          title: 'Orders',
          value: data.stats.orderCount,
          change: data.stats.orderChange,
          icon: ShoppingCart,
          format: 'number',
        },
        {
          title: 'Product Views',
          value: data.stats.productViews,
          change: data.stats.viewsChange,
          icon: Eye,
          format: 'number',
        },
        {
          title: 'Conversion Rate',
          value: data.stats.conversionRate,
          change: data.stats.conversionChange,
          icon: TrendingUp,
          format: 'percent',
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <ShoppingCart className="h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No data available</h2>
        <p className="mt-2 text-sm text-gray-500">
          Start selling to see your analytics data here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Track your store performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-orange-100 p-2">
                  <stat.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatValue(stat.value, stat.format)}
                </p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-center">
                <div>
                  <ShoppingCart className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No products yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.views.toLocaleString()} views · {product.sales.toLocaleString()} sales
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(product.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-center">
                <div>
                  <Eye className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.type === 'sale'
                          ? 'bg-green-500'
                          : activity.type === 'view'
                          ? 'bg-blue-500'
                          : activity.type === 'review'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        {activity.amount && (
                          <p className="text-xs font-medium text-green-600">
                            +{formatPrice(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.stats.orderCount > 0
                  ? formatPrice(data.stats.totalRevenue / data.stats.orderCount)
                  : formatPrice(0)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Revenue per View</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.stats.productViews > 0
                  ? formatPrice(data.stats.totalRevenue / data.stats.productViews)
                  : formatPrice(0)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.topProducts.length}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.stats.conversionRate}%
              </p>
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${Math.min(data.stats.conversionRate * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
