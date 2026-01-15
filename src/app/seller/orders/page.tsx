'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils/format'
import { getSellerOrders, updateOrderStatus, getOrderStatusCounts } from '@/actions/orders'

type Order = {
  id: string
  orderId: string
  orderNumber: string
  status: string
  paymentStatus: string
  productName: string
  productId: string | null
  quantity: number
  unitPrice: number
  total: number
  sellerAmount: number
  customer: { full_name: string; email: string }
  shippingAddress: Record<string, string> | null
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'Боловсруулж байна', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Илгээсэн', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Хүргэгдсэн', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Цуцлагдсан', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPending, startTransition] = useTransition()

  // Ship dialog
  const [shipDialogOpen, setShipDialogOpen] = useState(false)
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    const [ordersResult, countsResult] = await Promise.all([
      getSellerOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      }),
      getOrderStatusCounts(),
    ])

    if (ordersResult.error) {
      toast.error(ordersResult.error)
    } else {
      setOrders(ordersResult.orders || [])
    }

    if (!countsResult.error) {
      setStatusCounts(countsResult.counts || {})
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchOrders()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map((o) => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
  }

  const handleUpdateStatus = async (
    orderItemId: string,
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled',
    tracking?: string
  ) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderItemId, status, tracking)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Захиалгын төлөв: ${status}`)
        fetchOrders()
      }
    })
  }

  const handleShipOrder = (orderItemId: string) => {
    setSelectedOrderForShip(orderItemId)
    setTrackingNumber('')
    setShipDialogOpen(true)
  }

  const confirmShipOrder = () => {
    if (selectedOrderForShip) {
      handleUpdateStatus(selectedOrderForShip, 'shipped', trackingNumber || undefined)
      setShipDialogOpen(false)
      setSelectedOrderForShip(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Захиалгууд</h1>
          <p className="text-gray-500">Хэрэглэгчийн захиалгыг удирдах ба биелүүлэх</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Экспорт
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = statusCounts[key] || 0
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                statusFilter === key ? 'border-orange-300 bg-orange-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <config.icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{config.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Захиалга хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Бүх төлөв" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх төлөв</SelectItem>
            <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
            <SelectItem value="processing">Боловсруулж байна</SelectItem>
            <SelectItem value="shipped">Илгээсэн</SelectItem>
            <SelectItem value="delivered">Хүргэгдсэн</SelectItem>
            <SelectItem value="cancelled">Цуцлагдсан</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Захиалга</TableHead>
                <TableHead>Хэрэглэгч</TableHead>
                <TableHead>Бүтээгдэхүүн</TableHead>
                <TableHead>Нийт</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Огноо</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Clock
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.full_name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{order.productName}</p>
                        <p className="text-sm text-gray-500">Тоо: {order.quantity}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[order.status]?.color || 'bg-gray-100'}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Дэлгэрэнгүй харах
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Боловсруулж байна гэж тэмдэглэх
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <DropdownMenuItem onClick={() => handleShipOrder(order.id)}>
                              <Truck className="mr-2 h-4 w-4" />
                              Илгээсэн гэж тэмдэглэх
                            </DropdownMenuItem>
                          )}
                          {order.status === 'shipped' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Хүргэгдсэн гэж тэмдэглэх
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Захиалга цуцлах
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {!loading && orders.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 font-medium text-gray-900">Захиалга олдсонгүй</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Хайлт эсвэл шүүлтүүрээ өөрчлөөд үзнэ үү'
                : 'Хэрэглэгчид худалдан авалт хийхэд захиалгууд энд харагдана'}
            </p>
          </div>
        )}
      </div>

      {/* Ship Dialog */}
      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Захиалга илгээх</DialogTitle>
            <DialogDescription>
              Энэ ачааны хяналтын дугаарыг оруулна уу (заавал биш).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tracking">Хяналтын дугаар</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., 1Z999AA10123456784"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={confirmShipOrder}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Илгээсэн гэж тэмдэглэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
