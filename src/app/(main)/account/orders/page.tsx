import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { getUserOrders } from '@/actions/orders'

interface OrderItem {
  id: string
  productId: string
  name: string
  slug: string | null
  quantity: number
  price: number
  total: number
  status: string
  variantOptions: Record<string, string> | null
  image: string | null
}

interface Order {
  id: string
  orderId: string
  date: Date
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  shippingTotal: number
  taxTotal: number
  trackingNumber: string | null
  shippingAddress: Record<string, string> | null
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export default async function OrdersPage() {
  const { orders: rawOrders, error } = await getUserOrders()
  const orders = rawOrders as Order[]

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <Package className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Error loading orders</h2>
        <p className="mt-2 text-gray-500">{error}</p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
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
        <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
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
              <Badge className={cn('font-medium', statusConfig[order.status]?.color || 'bg-gray-100 text-gray-700')}>
                {statusConfig[order.status]?.label || order.status}
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
                    {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                      <p className="text-sm text-gray-500">
                        {Object.entries(item.variantOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="mt-1 font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.slug && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${item.slug}`}>Buy Again</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Actions */}
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              {order.trackingNumber && (
                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/account/orders/${order.orderId}`}>
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
