'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  User,
  FileText,
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Package,
  ShoppingCart,
  Store,
  Users,
  RotateCcw,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  getAuditLogs,
  getAuditLogStats,
  type AuditLogEntry,
} from '@/actions/admin'

const ACTION_LABELS: Record<string, string> = {
  'update_user_role': 'Хэрэглэгчийн үүрэг өөрчилсөн',
  'update_user_status': 'Хэрэглэгчийн төлөв өөрчилсөн',
  'update_seller_status': 'Худалдагчийн төлөв өөрчилсөн',
  'approve_seller': 'Худалдагч баталгаажуулсан',
  'reject_seller': 'Худалдагч татгалзсан',
  'suspend_seller': 'Худалдагч түдгэлзүүлсэн',
  'update_product_status': 'Бүтээгдэхүүний төлөв өөрчилсөн',
  'update_order_status': 'Захиалгын төлөв өөрчилсөн',
  'process_refund': 'Буцаалт хийсэн',
  'reconcile_sales_counts': 'Борлуулалтын тоо тулгасан',
  'impersonate_user': 'Хэрэглэгчээр нэвтэрсэн',
  'end_impersonation': 'Хэрэглэгчээс гарсан',
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action
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

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Дөнгөж сая'
  if (diffMins < 60) return `${diffMins} минутын өмнө`
  if (diffHours < 24) return `${diffHours} цагийн өмнө`
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`
  return formatDateTime(dateString)
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'update_user_role': <Users className="h-4 w-4" />,
  'update_user_status': <User className="h-4 w-4" />,
  'update_seller_status': <Store className="h-4 w-4" />,
  'approve_seller': <Store className="h-4 w-4" />,
  'reject_seller': <Store className="h-4 w-4" />,
  'suspend_seller': <Store className="h-4 w-4" />,
  'update_product_status': <Package className="h-4 w-4" />,
  'update_order_status': <ShoppingCart className="h-4 w-4" />,
  'process_refund': <RotateCcw className="h-4 w-4" />,
  'reconcile_sales_counts': <Activity className="h-4 w-4" />,
  'impersonate_user': <Shield className="h-4 w-4" />,
  'end_impersonation': <Shield className="h-4 w-4" />,
}

const ACTION_COLORS: Record<string, string> = {
  'approve_seller': 'bg-green-100 text-green-800',
  'reject_seller': 'bg-red-100 text-red-800',
  'suspend_seller': 'bg-orange-100 text-orange-800',
  'process_refund': 'bg-purple-100 text-purple-800',
  'impersonate_user': 'bg-yellow-100 text-yellow-800',
  'update_user_role': 'bg-blue-100 text-blue-800',
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  'user': 'Хэрэглэгч',
  'seller': 'Худалдагч',
  'product': 'Бүтээгдэхүүн',
  'order': 'Захиалга',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalLogs: number
    todayLogs: number
    uniqueAdmins: number
    topActions: { action: string; count: number }[]
  } | null>(null)

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadLogs()
  }, [actionFilter, entityTypeFilter, dateFrom, dateTo, page])

  async function loadStats() {
    const result = await getAuditLogStats()
    if (result.stats) {
      setStats(result.stats)
    }
  }

  async function loadLogs() {
    setLoading(true)
    const result = await getAuditLogs({
      action: actionFilter !== 'all' ? actionFilter : undefined,
      targetEntityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      setLogs(result.logs || [])
      setTotal(result.total || 0)
    }
    setLoading(false)
  }

  function handleRefresh() {
    loadStats()
    loadLogs()
    toast.success('Лог шинэчлэгдлээ')
  }

  function handleResetFilters() {
    setActionFilter('all')
    setEntityTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Нийт лог</p>
                <p className="text-2xl font-bold">{stats?.totalLogs || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Өнөөдрийн лог</p>
                <p className="text-2xl font-bold">{stats?.todayLogs || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Админуудын тоо</p>
                <p className="text-2xl font-bold">{stats?.uniqueAdmins || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Түгээмэл үйлдлүүд</p>
              <div className="space-y-1">
                {stats?.topActions.slice(0, 3).map((item) => (
                  <div key={item.action} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{getActionLabel(item.action)}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Админ үйлдлийн лог</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Шинэчлэх
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Үйлдэл сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх үйлдэл</SelectItem>
                <SelectItem value="approve_seller">Худалдагч баталгаажуулсан</SelectItem>
                <SelectItem value="reject_seller">Худалдагч татгалзсан</SelectItem>
                <SelectItem value="suspend_seller">Худалдагч түдгэлзүүлсэн</SelectItem>
                <SelectItem value="update_user_role">Үүрэг өөрчилсөн</SelectItem>
                <SelectItem value="update_order_status">Захиалга шинэчилсэн</SelectItem>
                <SelectItem value="process_refund">Буцаалт хийсэн</SelectItem>
                <SelectItem value="impersonate_user">Хэрэглэгчээр нэвтэрсэн</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={(v) => { setEntityTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Төрөл сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх төрөл</SelectItem>
                <SelectItem value="user">Хэрэглэгч</SelectItem>
                <SelectItem value="seller">Худалдагч</SelectItem>
                <SelectItem value="product">Бүтээгдэхүүн</SelectItem>
                <SelectItem value="order">Захиалга</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-[140px]"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-[140px]"
              />
            </div>

            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Цэвэрлэх
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Огноо</TableHead>
                  <TableHead>Үйлдэл</TableHead>
                  <TableHead>Админ</TableHead>
                  <TableHead>Зорилтот обьект</TableHead>
                  <TableHead>Дэлгэрэнгүй</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Уншиж байна...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Лог олдсонгүй
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="font-medium">{formatRelativeTime(log.created_at)}</div>
                        <div className="text-xs text-gray-400">{formatDateTime(log.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                          <span className="mr-1">{ACTION_ICONS[log.action] || <Activity className="h-3 w-3" />}</span>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.admin?.full_name || 'Тодорхойгүй'}</div>
                          <div className="text-xs text-gray-400">{log.admin?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.target_entity_type && (
                          <div className="text-sm">
                            <Badge variant="outline" className="mb-1">
                              {ENTITY_TYPE_LABELS[log.target_entity_type] || log.target_entity_type}
                            </Badge>
                            {log.target_user && (
                              <div className="text-xs text-gray-500">
                                {log.target_user.full_name || log.target_user.email}
                              </div>
                            )}
                            {log.target_entity_id && !log.target_user && (
                              <div className="text-xs text-gray-400 font-mono">
                                {log.target_entity_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-xs text-gray-500 max-w-[200px]">
                            {Object.entries(log.metadata).slice(0, 2).map(([key, value]) => (
                              <div key={key} className="truncate">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Нийт {total} лог, {page}/{totalPages} хуудас
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Өмнөх
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Дараах
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
