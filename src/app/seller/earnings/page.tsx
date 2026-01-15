'use client'

import { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils/format'

// Placeholder earnings data
const earningsStats = {
  availableBalance: 3245.67,
  pendingBalance: 892.45,
  totalEarned: 12847.32,
  thisMonth: 2156.78,
}

const payouts = [
  {
    id: 'PO-001',
    amount: 1500.0,
    status: 'completed',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    method: 'Bank Transfer',
    reference: 'REF-2024-001',
  },
  {
    id: 'PO-002',
    amount: 892.45,
    status: 'pending',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    method: 'Bank Transfer',
    reference: 'REF-2024-002',
  },
  {
    id: 'PO-003',
    amount: 2150.0,
    status: 'completed',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    method: 'Bank Transfer',
    reference: 'REF-2024-003',
  },
  {
    id: 'PO-004',
    amount: 1800.0,
    status: 'completed',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17),
    method: 'Bank Transfer',
    reference: 'REF-2024-004',
  },
]

const transactions = [
  {
    id: 'TRX-001',
    type: 'sale',
    description: 'Order #ORD-156',
    amount: 79.99,
    fee: 3.2,
    net: 76.79,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'TRX-002',
    type: 'sale',
    description: 'Order #ORD-155',
    amount: 124.97,
    fee: 5.0,
    net: 119.97,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'TRX-003',
    type: 'refund',
    description: 'Refund for Order #ORD-152',
    amount: -45.99,
    fee: 0,
    net: -45.99,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'TRX-004',
    type: 'sale',
    description: 'Order #ORD-154',
    amount: 249.99,
    fee: 10.0,
    net: 239.99,
    date: new Date(Date.now() - 1000 * 60 * 60 * 28),
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function EarningsPage() {
  const [period, setPeriod] = useState('30d')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500">Track your revenue and payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Wallet className="mr-2 h-4 w-4" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Available Balance</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(earningsStats.availableBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Pending Balance</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(earningsStats.pendingBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Processing (2-5 days)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(earningsStats.thisMonth)}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>12.5% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Total Earned</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatPrice(earningsStats.totalEarned)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect Status */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Stripe Connect Account</p>
              <p className="text-sm text-gray-500">
                Connected · Payouts enabled
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage in Stripe
          </Button>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payout History</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => {
                const StatusIcon = statusConfig[payout.status].icon
                return (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.id}</TableCell>
                    <TableCell className="text-gray-500">
                      {payout.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(payout.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[payout.status].color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[payout.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <p className="text-xs text-gray-500">{txn.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {txn.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell
                    className={
                      txn.type === 'refund' ? 'text-red-600' : 'text-gray-900'
                    }
                  >
                    {txn.type === 'refund' ? '-' : ''}
                    {formatPrice(Math.abs(txn.amount))}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {txn.fee > 0 ? `-${formatPrice(txn.fee)}` : '-'}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      txn.net < 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {txn.net >= 0 ? '+' : ''}
                    {formatPrice(txn.net)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
