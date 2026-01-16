'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getSellerEarningsStats, getSellerTransactions } from '@/actions/seller'

type EarningsStats = {
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  thisMonth: number
  monthChange: number
  commissionRate: number
}

type Transaction = {
  id: string
  type: 'sale' | 'refund'
  description: string
  productName: string
  amount: number
  fee: number
  net: number
  status: string
  date: Date
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  delivered: { label: 'Хүргэгдсэн', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  shipped: { label: 'Илгээсэн', color: 'bg-blue-100 text-blue-700', icon: Package },
  processing: { label: 'Боловсруулж байна', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending: { label: 'Хүлээгдэж буй', color: 'bg-gray-100 text-gray-700', icon: Clock },
  cancelled: { label: 'Цуцлагдсан', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<EarningsStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsResult, txnResult] = await Promise.all([
          getSellerEarningsStats(),
          getSellerTransactions(20),
        ])

        if (statsResult.stats) {
          setStats(statsResult.stats)
        }
        if (txnResult.transactions) {
          setTransactions(txnResult.transactions)
        }
      } catch (error) {
        console.error('Error fetching earnings data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const hasNoData = !stats || (stats.totalEarned === 0 && transactions.length === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Орлого</h1>
          <p className="text-gray-500">Орлого болон гүйлгээг хянах</p>
        </div>
        {transactions.length > 0 && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        )}
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Боломжит үлдэгдэл</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(stats?.availableBalance || 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Хүргэгдсэн захиалгуудаас</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Хүлээгдэж буй</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(stats?.pendingBalance || 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Илгээж буй захиалгуудаас</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                {(stats?.monthChange || 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <span className="text-sm text-gray-500">Энэ сар</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(stats?.thisMonth || 0)}
            </p>
            {stats?.monthChange !== 0 && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${
                (stats?.monthChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.monthChange || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>Өмнөх сараас {Math.abs(stats?.monthChange || 0)}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Нийт олсон орлого</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(stats?.totalEarned || 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Комисс: {stats?.commissionRate || 10}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* No Data State */}
      {hasNoData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Одоогоор орлого байхгүй</h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              Таны бүтээгдэхүүн зарагдсаны дараа энд орлогын мэдээлэл харагдана.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Transaction History */
        <Card>
          <CardHeader>
            <CardTitle>Сүүлийн гүйлгээнүүд</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Гүйлгээ байхгүй байна</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Захиалга</TableHead>
                    <TableHead>Бүтээгдэхүүн</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Дүн</TableHead>
                    <TableHead>Комисс</TableHead>
                    <TableHead>Цэвэр орлого</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const statusInfo = statusConfig[txn.status] || statusConfig.pending
                    const StatusIcon = statusInfo.icon
                    return (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{txn.description}</p>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-[200px] truncate text-sm text-gray-600">
                            {txn.productName}
                          </p>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(txn.date).toLocaleDateString('mn-MN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {formatPrice(txn.amount)}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          -{formatPrice(txn.fee)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          +{formatPrice(txn.net)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
