'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Percent,
  Store,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import {
  getAllSellers,
  updateSellerStatus,
  updateCommissionRate,
} from '@/actions/admin'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Баталгаажсан', color: 'bg-green-100 text-green-800' },
  suspended: { label: 'Түдгэлзүүлсэн', color: 'bg-red-100 text-red-800' },
  rejected: { label: 'Татгалзсан', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminSellersPage() {
  const [isPending, startTransition] = useTransition()

  const [sellers, setSellers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<any>(null)
  const [newCommission, setNewCommission] = useState('10')

  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    rejected: 0,
  })

  useEffect(() => {
    loadSellers()
  }, [page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSellers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadSellers = async () => {
    setLoading(true)
    const result = await getAllSellers({
      search: search || undefined,
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      page,
      limit: 20,
    })

    if ('sellers' in result) {
      setSellers(result.sellers || [])
      setTotal(result.total || 0)

      // Update counts for the current filter
      if (statusFilter === 'all') {
        setStatusCounts((prev) => ({ ...prev, all: result.total || 0 }))
      } else {
        setStatusCounts((prev) => ({ ...prev, [statusFilter]: result.total || 0 }))
      }
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (
    sellerId: string,
    status: 'approved' | 'rejected' | 'suspended'
  ) => {
    startTransition(async () => {
      const result = await updateSellerStatus(sellerId, status)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        const messages: Record<string, string> = {
          approved: 'Худалдагч баталгаажлаа',
          rejected: 'Худалдагчийг татгалзлаа',
          suspended: 'Худалдагчийг түдгэлзүүллээ',
        }
        toast.success(messages[status])
        loadSellers()
      }
    })
  }

  const handleUpdateCommission = async () => {
    if (!selectedSeller) return

    const rate = parseFloat(newCommission)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Комиссийн хувь 0-100 хооронд байх ёстой')
      return
    }

    startTransition(async () => {
      const result = await updateCommissionRate(selectedSeller.id, rate)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Комиссийн хувь шинэчлэгдлээ')
        loadSellers()
      }
      setCommissionDialogOpen(false)
      setSelectedSeller(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex gap-2">
            Бүгд
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex gap-2">
            <Clock className="h-4 w-4" />
            Хүлээгдэж буй
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex gap-2">
            <CheckCircle className="h-4 w-4" />
            Баталгаажсан
          </TabsTrigger>
          <TabsTrigger value="suspended" className="flex gap-2">
            <Ban className="h-4 w-4" />
            Түдгэлзүүлсэн
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex gap-2">
            <XCircle className="h-4 w-4" />
            Татгалзсан
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Худалдагчдын удирдлага</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Дэлгүүрийн нэрээр хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : sellers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Store className="mb-4 h-12 w-12 text-gray-300" />
              <p>Худалдагч олдсонгүй</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дэлгүүр</TableHead>
                    <TableHead>Эзэмшигч</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead>Комисс</TableHead>
                    <TableHead>Борлуулалт</TableHead>
                    <TableHead>Орлого</TableHead>
                    <TableHead>Бүртгүүлсэн</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                            <Store className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{seller.store_name}</p>
                            <p className="text-sm text-gray-500">{seller.store_slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {seller.users?.full_name || 'Нэр оруулаагүй'}
                          </p>
                          <p className="text-sm text-gray-500">{seller.users?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[seller.status]?.color}>
                          {statusConfig[seller.status]?.label || seller.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{seller.commission_rate}%</span>
                      </TableCell>
                      <TableCell>{seller.total_sales || 0}</TableCell>
                      <TableCell>{formatPrice(seller.total_revenue || 0)}</TableCell>
                      <TableCell>{formatDate(seller.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Дэлгэрэнгүй харах
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSeller(seller)
                                setNewCommission(seller.commission_rate?.toString() || '10')
                                setCommissionDialogOpen(true)
                              }}
                            >
                              <Percent className="mr-2 h-4 w-4" />
                              Комисс өөрчлөх
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {seller.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(seller.id, 'approved')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Баталгаажуулах
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(seller.id, 'rejected')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Татгалзах
                                </DropdownMenuItem>
                              </>
                            )}
                            {seller.status === 'approved' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(seller.id, 'suspended')}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Түдгэлзүүлэх
                              </DropdownMenuItem>
                            )}
                            {seller.status === 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(seller.id, 'approved')}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Сэргээх
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
                <p className="text-sm text-gray-500">Нийт {total} худалдагч</p>
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
                    disabled={sellers.length < 20}
                  >
                    Дараах
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Commission Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Комиссийн хувь өөрчлөх</DialogTitle>
            <DialogDescription>
              {selectedSeller?.store_name} дэлгүүрийн комиссийн хувийг өөрчилнө
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="commission">Комиссийн хувь (%)</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                className="max-w-[120px]"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Платформын үндсэн комисс: 10%
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleUpdateCommission} disabled={isPending}>
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
