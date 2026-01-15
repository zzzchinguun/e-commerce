'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

// Placeholder orders - will be replaced with real data
const placeholderOrders = [
  {
    id: 'ORD-001',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'delivered',
    total: 129.99,
    items: [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        quantity: 1,
        price: 79.99,
        image: null,
      },
      {
        id: '2',
        name: 'Phone Case - Clear',
        quantity: 2,
        price: 25.00,
        image: null,
      },
    ],
  },
  {
    id: 'ORD-002',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    status: 'shipped',
    total: 45.99,
    items: [
      {
        id: '3',
        name: 'Premium Cotton T-Shirt',
        quantity: 1,
        price: 24.99,
        image: null,
      },
      {
        id: '4',
        name: 'Socks 3-Pack',
        quantity: 1,
        price: 12.00,
        image: null,
      },
    ],
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export default function OrdersPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // For demo, use empty array to show empty state, or placeholderOrders for orders
  const orders: typeof placeholderOrders = []

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">No orders yet</h2>
        <p className="mt-2 text-gray-500">
          When you place orders, they will appear here.
        </p>
        <Button asChild className="mt-6 bg-orange-500 hover:bg-orange-600">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-white">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Order placed</span>
                  <p className="font-medium text-gray-900">
                    {order.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total</span>
                  <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Order #</span>
                  <p className="font-medium text-gray-900">{order.id}</p>
                </div>
              </div>
              <Badge className={cn('font-medium', statusConfig[order.status].color)}>
                {statusConfig[order.status].label}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/products/${item.id}`}>Buy Again</Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      Write Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Actions */}
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <Button variant="outline" size="sm">
                Track Package
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/account/orders/${order.id}`}>
                  View Order Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
