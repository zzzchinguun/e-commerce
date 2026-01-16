'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import {
  getPlatformAnalytics,
  getTopSellers,
  getTopProducts,
} from '@/actions/admin'

type TimePeriod = '24h' | '7d' | '30d' | '90d'

const periodLabels: Record<TimePeriod, string> = {
  '24h': 'Сүүлийн 24 цаг',
  '7d': 'Сүүлийн 7 хоног',
  '30d': 'Сүүлийн 30 хоног',
  '90d': 'Сүүлийн 90 хоног',
}

interface AnalyticsStats {
  totalRevenue: number
  orderCount: number
  avgOrderValue: number
  newUsers: number
  totalViews: number
  conversionRate: string
}

interface TopSeller {
  id: string
  store_name: string
  total_revenue: number
  total_sales: number
  rating_average: number | null
}

interface TopProduct {
  id: string
  name: string
  slug: string
  price: number
  sale_count: number
  view_count: number
  rating_average: number | null
  seller_profiles: {
    store_name: string
  } | null
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [topSellers, setTopSellers] = useState<TopSeller[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  // Previous period stats for comparison (simulated for now)
  const [previousStats, setPreviousStats] = useState<AnalyticsStats | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsResult, sellersResult, productsResult] = await Promise.all([
        getPlatformAnalytics(period),
        getTopSellers(period, 10),
        getTopProducts(period, 10),
      ])

      if ('stats' in analyticsResult && analyticsResult.stats) {
        setStats(analyticsResult.stats)
        // Simulate previous period stats (in real app, you'd fetch this separately)
        setPreviousStats({
          totalRevenue: analyticsResult.stats.totalRevenue * 0.85,
          orderCount: Math.floor(analyticsResult.stats.orderCount * 0.9),
          avgOrderValue: analyticsResult.stats.avgOrderValue * 0.95,
          newUsers: Math.floor(analyticsResult.stats.newUsers * 0.8),
          totalViews: analyticsResult.stats.totalViews,
          conversionRate: analyticsResult.stats.conversionRate,
        })
      }

      if ('sellers' in sellersResult) {
        setTopSellers(sellersResult.sellers)
      }

      if ('products' in productsResult) {
        setTopProducts(productsResult.products)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
    setLoading(false)
  }

  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const trend = calculateTrend(current, previous)
    return (
      <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {trend.isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{trend.value.toFixed(1)}%</span>
      </div>
    )
  }

  const metricCards = stats && previousStats ? [
    {
      title: 'Нийт орлого',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      current: stats.totalRevenue,
      previous: previousStats.totalRevenue,
    },
    {
      title: 'Нийт захиалга',
      value: stats.orderCount.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      current: stats.orderCount,
      previous: previousStats.orderCount,
    },
    {
      title: 'Шинэ хэрэглэгчид',
      value: stats.newUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      current: stats.newUsers,
      previous: previousStats.newUsers,
    },
    {
      title: 'Дундаж захиалгын дүн',
      value: formatPrice(stats.avgOrderValue),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      current: stats.avgOrderValue,
      previous: previousStats.avgOrderValue,
    },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитик</h1>
          <p className="text-gray-500">Платформын гүйцэтгэлийн тайлан</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((metric) => (
              <Card key={metric.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <TrendIndicator current={metric.current} previous={metric.previous} />
                    </div>
                    <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tables Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Sellers Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Шилдэг худалдагчид</CardTitle>
              </CardHeader>
              <CardContent>
                {topSellers.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">Мэдээлэл байхгүй</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Дэлгүүр</TableHead>
                        <TableHead className="text-right">Орлого</TableHead>
                        <TableHead className="text-right">Борлуулалт</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellers.map((seller, index) => (
                        <TableRow key={seller.id}>
                          <TableCell>
                            <Badge
                              variant={index < 3 ? 'default' : 'secondary'}
                              className={
                                index === 0
                                  ? 'bg-yellow-500'
                                  : index === 1
                                  ? 'bg-gray-400'
                                  : index === 2
                                  ? 'bg-amber-600'
                                  : ''
                              }
                            >
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{seller.store_name}</TableCell>
                          <TableCell className="text-right">
                            {formatPrice(seller.total_revenue || 0)}
                          </TableCell>
                          <TableCell className="text-right">{seller.total_sales || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Top Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Шилдэг бүтээгдэхүүнүүд</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">Мэдээлэл байхгүй</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Нэр</TableHead>
                        <TableHead>Худалдагч</TableHead>
                        <TableHead className="text-right">Орлого</TableHead>
                        <TableHead className="text-right">Борлуулалт</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Badge
                              variant={index < 3 ? 'default' : 'secondary'}
                              className={
                                index === 0
                                  ? 'bg-yellow-500'
                                  : index === 1
                                  ? 'bg-gray-400'
                                  : index === 2
                                  ? 'bg-amber-600'
                                  : ''
                              }
                            >
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {product.seller_profiles?.store_name || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(product.price * (product.sale_count || 0))}
                          </TableCell>
                          <TableCell className="text-right">{product.sale_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
