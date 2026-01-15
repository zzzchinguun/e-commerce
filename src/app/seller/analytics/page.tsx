'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
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

// Placeholder analytics data
const stats = [
  {
    title: 'Total Revenue',
    value: 12847.32,
    change: 12.5,
    icon: DollarSign,
    format: 'currency',
  },
  {
    title: 'Orders',
    value: 156,
    change: 8.2,
    icon: ShoppingCart,
    format: 'number',
  },
  {
    title: 'Product Views',
    value: 4521,
    change: -3.1,
    icon: Eye,
    format: 'number',
  },
  {
    title: 'Conversion Rate',
    value: 3.45,
    change: 0.8,
    icon: TrendingUp,
    format: 'percent',
  },
]

const topProducts = [
  { name: 'Wireless Bluetooth Headphones', views: 1245, sales: 45, revenue: 3599.55 },
  { name: 'Premium Cotton T-Shirt', views: 892, sales: 38, revenue: 949.62 },
  { name: 'Portable Bluetooth Speaker', views: 756, sales: 32, revenue: 1471.68 },
  { name: 'USB-C Charging Cable', views: 634, sales: 67, revenue: 870.33 },
  { name: 'Phone Case - Clear', views: 523, sales: 28, revenue: 419.72 },
]

const recentActivity = [
  { type: 'sale', message: 'New order #ORD-156 placed', time: '2 minutes ago', amount: 79.99 },
  { type: 'view', message: 'Wireless Headphones viewed 23 times', time: '1 hour ago' },
  { type: 'review', message: 'New 5-star review on Premium T-Shirt', time: '3 hours ago' },
  { type: 'sale', message: 'New order #ORD-155 placed', time: '5 hours ago', amount: 124.97 },
  { type: 'stock', message: 'USB-C Cable running low (5 left)', time: '6 hours ago' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')

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
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Revenue chart</p>
                <p className="text-xs text-gray-400">Connect to database to see real data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Orders chart</p>
                <p className="text-xs text-gray-400">Connect to database to see real data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.views} views · {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { source: 'Direct', visits: 1245, percent: 35 },
              { source: 'Search', visits: 892, percent: 25 },
              { source: 'Social', visits: 756, percent: 21 },
              { source: 'Referral', visits: 678, percent: 19 },
            ].map((item) => (
              <div key={item.source} className="rounded-lg border p-4">
                <p className="text-sm text-gray-500">{item.source}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {item.visits.toLocaleString()}
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{item.percent}% of traffic</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
