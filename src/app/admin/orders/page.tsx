'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  MoreHorizontal,
  Eye,
  RefreshCcw,
  Package,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import {
  getAllOrders,
  getOrderStatusCounts,
  updateOrderStatusAsAdmin,
  processOrderRefund,
} from '@/actions/admin'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Хүлээгдэж буй',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="h-4 w-4" />
  },
  confirmed: {
    label: 'Баталгаажсан',
    color: 'bg-blue-100 text-blue-800',
    icon: <CheckCircle className="h-4 w-4" />
  },
  processing: {
    label: 'Боловсруулж байна',
    color: 'bg-purple-100 text-purple-800',
    icon: <Package className="h-4 w-4" />
  },
  shipped: {
    label: 'Илгээгдсэн',
    color: 'bg-indigo-100 text-indigo-800',
    icon: <Truck className="h-4 w-4" />
  },
  delivered: {
    label: 'Хүргэгдсэн',
    color: 'bg-green-100 text-green-800',
    icon: <PackageCheck className="h-4 w-4" />
  },
  cancelled: {
    label: 'Цуцлагдсан',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />
  },
  refunded: {
    label: 'Буцаагдсан',
    color: 'bg-gray-100 text-gray-800',
    icon: <RotateCcw className="h-4 w-4" />
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  succeeded: { label: 'Төлөгдсөн', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Амжилтгүй', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Буцаагдсан', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newStatus, setNewStatus] = useState('')

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  })

  useEffect(() => {
    loadStatusCounts()
  }, [])

  useEffect(() => {
    loadOrders()
  }, [page, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadStatusCounts = async () => {
    const result = await getOrderStatusCounts()
    if ('counts' in result && result.counts) {
      setStatusCounts(result.counts)
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    const result = await getAllOrders({
      search: search || undefined,
      orderStatus: statusFilter !== 'all' ? statusFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 20,
    })

    if ('orders' in result) {
      setOrders(result.orders || [])
      setTotal(result.total || 0)
    }
    setLoading(false)
  }

  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    startTransition(async () => {
      const result = await updateOrderStatusAsAdmin(selectedOrder.id, newStatus)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        const statusLabel = orderStatusConfig[newStatus]?.label || newStatus
        toast.success(`Захиалгын төлөв "${statusLabel}" болж өөрчлөгдлөө`)
        loadOrders()
        loadStatusCounts()
      }
      setStatusDialogOpen(false)
      setSelectedOrder(null)
      setNewStatus('')
    })
  }

  const handleProcessRefund = async () => {
    if (!selectedOrder) return

    startTransition(async () => {
      const result = await processOrderRefund(selectedOrder.id, {
        reason: 'requested_by_customer',
      })
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Буцаалт амжилттай боловсруулагдлаа')
        if (result.refundId) {
          toast.info(`Stripe буцаалтын ID: ${result.refundId}`)
        }
        loadOrders()
        loadStatusCounts()
      }
      setRefundDialogOpen(false)
      setSelectedOrder(null)
    })
  }

  const openStatusDialog = (order: any) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusDialogOpen(true)
  }

  const openRefundDialog = (order: any) => {
    setSelectedOrder(order)
    setRefundDialogOpen(true)
  }

  const totalOrdersCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => handleStatusFilterClick('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Бүгд</p>
                <p className="text-2xl font-bold">{totalOrdersCount}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(orderStatusConfig).map(([status, config]) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === status ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => handleStatusFilterClick(status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{config.label}</p>
                  <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                </div>
                <div className={`rounded-full p-2 ${config.color}`}>
                  {config.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Захиалгын удирдлага</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Захиалгын дугаараар хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={(value) => handleStatusFilterClick(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Төлөв сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх төлөв</SelectItem>
                  {Object.entries(orderStatusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[140px]"
                  placeholder="Эхлэх огноо"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[140px]"
                  placeholder="Дуусах огноо"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setDateFrom('')
                  setDateTo('')
                  setPage(1)
                }}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
              <p>Захиалга олдсонгүй</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Захиалгын дугаар</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Нийт дүн</TableHead>
                    <TableHead>Төлбөрийн төлөв</TableHead>
                    <TableHead>Захиалгын төлөв</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-mono font-medium text-orange-600">
                          {order.order_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.users?.full_name || 'Нэр оруулаагүй'}
                          </p>
                          <p className="text-sm text-gray-500">{order.users?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatPrice(order.grand_total || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusConfig[order.payment_status]?.color || 'bg-gray-100 text-gray-800'}>
                          {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={orderStatusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}>
                          {orderStatusConfig[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(order.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Дэлгэрэнгүй харах
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Төлөв өөрчлөх
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.payment_status === 'succeeded' && order.status !== 'refunded' && (
                              <DropdownMenuItem
                                onClick={() => openRefundDialog(order)}
                                className="text-red-600"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Буцаалт боловсруулах
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Нийт {total} захиалга</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Өмнөх
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={orders.length < 20}
                  >
                    Дараах
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Захиалгын төлөв өөрчлөх</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number} дугаартай захиалгын төлөвийг өөрчилнө
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status">Шинэ төлөв</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Төлөв сонгох" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Буцаалт боловсруулах</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number} дугаартай захиалгын буцаалтыг баталгаажуулна уу
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Анхааруулга:</strong> Энэ үйлдэл нь захиалгын төлөвийг "Буцаагдсан" болгож өөрчилнө.
                Төлбөрийн буцаалтыг тусад нь боловсруулах шаардлагатай.
              </p>
            </div>
            {selectedOrder && (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Захиалгын дүн:</span>{' '}
                  <span className="font-medium">{formatPrice(selectedOrder.grand_total || 0)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Хэрэглэгч:</span>{' '}
                  <span className="font-medium">{selectedOrder.users?.full_name || selectedOrder.users?.email}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleProcessRefund} disabled={isPending}>
              {isPending ? 'Боловсруулж байна...' : 'Буцаалт баталгаажуулах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
