'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  MoreHorizontal,
  UserCog,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  Store,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { toast } from 'sonner'
import {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  startImpersonation,
} from '@/actions/admin'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState<'customer' | 'seller' | 'admin'>('customer')

  useEffect(() => {
    loadUsers()
  }, [page, roleFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers({
      search: search || undefined,
      role: roleFilter !== 'all' ? (roleFilter as any) : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit: 20,
    })

    if ('users' in result) {
      setUsers(result.users || [])
      setTotal(result.total || 0)
    }
    setLoading(false)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    startTransition(async () => {
      const result = await updateUserRole(selectedUser.id, newRole)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Хэрэглэгчийн үүрэг шинэчлэгдлээ')
        loadUsers()
      }
      setRoleDialogOpen(false)
      setSelectedUser(null)
    })
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleUserStatus(userId, !currentStatus)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success(currentStatus ? 'Хэрэглэгч идэвхгүй болгогдлоо' : 'Хэрэглэгч идэвхжүүлэгдлээ')
        loadUsers()
      }
    })
  }

  const handleImpersonate = async (userId: string) => {
    startTransition(async () => {
      const result = await startImpersonation(userId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Хэрэглэгч шиг харах горимд орлоо')
        router.push(result.redirectTo || '/')
      }
    })
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      seller: 'bg-blue-100 text-blue-800',
      customer: 'bg-gray-100 text-gray-800',
    }
    const icons: Record<string, any> = {
      admin: Shield,
      seller: Store,
      customer: User,
    }
    const texts: Record<string, string> = {
      admin: 'Админ',
      seller: 'Худалдагч',
      customer: 'Хэрэглэгч',
    }
    const Icon = icons[role] || User
    return (
      <Badge className={styles[role] || 'bg-gray-100 text-gray-800'}>
        <Icon className="mr-1 h-3 w-3" />
        {texts[role] || role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Хэрэглэгчдийн удирдлага</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Нэр, имэйлээр хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Үүргээр шүүх" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх үүрэг</SelectItem>
                <SelectItem value="customer">Хэрэглэгч</SelectItem>
                <SelectItem value="seller">Худалдагч</SelectItem>
                <SelectItem value="admin">Админ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Төлвөөр шүүх" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх төлөв</SelectItem>
                <SelectItem value="active">Идэвхтэй</SelectItem>
                <SelectItem value="inactive">Идэвхгүй</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <User className="mb-4 h-12 w-12 text-gray-300" />
              <p>Хэрэглэгч олдсонгүй</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Үүрэг</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead>Бүртгүүлсэн</TableHead>
                    <TableHead>Сүүлийн нэвтрэлт</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || 'Нэр оруулаагүй'}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {user.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        {user.last_login_at ? formatDate(user.last_login_at) : '-'}
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
                              onClick={() => handleImpersonate(user.id)}
                              disabled={user.role === 'admin'}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Хэрэглэгч шиг харах
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setRoleDialogOpen(true)
                              }}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Үүрэг өөрчлөх
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              className={user.is_active ? 'text-red-600' : 'text-green-600'}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Идэвхгүй болгох
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Идэвхжүүлэх
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Нийт {total} хэрэглэгч
                </p>
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
                    disabled={users.length < 20}
                  >
                    Дараах
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хэрэглэгчийн үүрэг өөрчлөх</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || selectedUser?.email} хэрэглэгчийн үүргийг өөрчилнө
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Хэрэглэгч
                  </div>
                </SelectItem>
                <SelectItem value="seller">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Худалдагч
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Админ
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleUpdateRole} disabled={isPending}>
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
