'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import {
  Search,
  MoreHorizontal,
  Package,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  Ban,
  CheckCircle,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
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
import { formatPrice } from '@/lib/utils/format'
import {
  getAllProducts,
  updateProductStatus,
  toggleProductFeatured,
  deleteProductAsAdmin,
  bulkUpdateProducts,
  getAllCategories,
  getAllSellers,
} from '@/actions/admin'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Ноорог', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Идэвхтэй', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Идэвхгүй', color: 'bg-yellow-100 text-yellow-800' },
  out_of_stock: { label: 'Дууссан', color: 'bg-red-100 text-red-800' },
  deleted: { label: 'Устгасан', color: 'bg-red-100 text-red-800' },
}

export default function AdminProductsPage() {
  const [isPending, startTransition] = useTransition()

  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sellerFilter, setSellerFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [categories, setCategories] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>('')

  // Load categories and sellers on mount
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Load products on filter change
  useEffect(() => {
    loadProducts()
  }, [page, statusFilter, categoryFilter, sellerFilter, featuredFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadFilterOptions = async () => {
    const [categoriesResult, sellersResult] = await Promise.all([
      getAllCategories(),
      getAllSellers({ limit: 1000 }),
    ])

    if ('categories' in categoriesResult) {
      setCategories(categoriesResult.categories || [])
    }
    if ('sellers' in sellersResult) {
      setSellers(sellersResult.sellers || [])
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProducts({
      search: search || undefined,
      productStatus: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      seller: sellerFilter !== 'all' ? sellerFilter : undefined,
      featured: featuredFilter === 'featured' ? true : featuredFilter === 'not_featured' ? false : undefined,
      page,
      limit: 20,
    })

    if ('products' in result) {
      setProducts(result.products || [])
      setTotal(result.total || 0)
    }
    setLoading(false)
  }

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    startTransition(async () => {
      const result = await toggleProductFeatured(productId, !currentFeatured)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success(currentFeatured ? 'Онцлох бүтээгдэхүүнээс хаслаа' : 'Онцлох бүтээгдэхүүнд нэмлээ')
        loadProducts()
      }
    })
  }

  const handleUpdateStatus = async (productId: string, status: string) => {
    startTransition(async () => {
      const result = await updateProductStatus(productId, status)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        const messages: Record<string, string> = {
          active: 'Бүтээгдэхүүн идэвхжүүлэгдлээ',
          inactive: 'Бүтээгдэхүүн идэвхгүй болголоо',
        }
        toast.success(messages[status] || 'Төлөв шинэчлэгдлээ')
        loadProducts()
      }
    })
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    startTransition(async () => {
      const result = await deleteProductAsAdmin(productToDelete.id)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Бүтээгдэхүүн устгагдлаа')
        loadProducts()
      }
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId])
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  const handleBulkAction = async () => {
    if (selectedProducts.length === 0 || !bulkAction) return

    startTransition(async () => {
      let updates: { status?: string; is_featured?: boolean } = {}
      let successMessage = ''

      switch (bulkAction) {
        case 'activate':
          updates = { status: 'active' }
          successMessage = 'Сонгосон бүтээгдэхүүнүүд идэвхжүүлэгдлээ'
          break
        case 'deactivate':
          updates = { status: 'inactive' }
          successMessage = 'Сонгосон бүтээгдэхүүнүүд идэвхгүй болголоо'
          break
        case 'feature':
          updates = { is_featured: true }
          successMessage = 'Сонгосон бүтээгдэхүүнүүд онцлох болгогдлоо'
          break
        case 'unfeature':
          updates = { is_featured: false }
          successMessage = 'Сонгосон бүтээгдэхүүнүүд онцлохоос хасагдлаа'
          break
        case 'delete':
          updates = { status: 'deleted' }
          successMessage = 'Сонгосон бүтээгдэхүүнүүд устгагдлаа'
          break
      }

      const result = await bulkUpdateProducts(selectedProducts, updates)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success(successMessage)
        setSelectedProducts([])
        loadProducts()
      }
      setBulkActionDialogOpen(false)
      setBulkAction('')
    })
  }

  const openBulkActionDialog = (action: string) => {
    setBulkAction(action)
    setBulkActionDialogOpen(true)
  }

  const getBulkActionMessage = () => {
    const count = selectedProducts.length
    switch (bulkAction) {
      case 'activate':
        return `${count} бүтээгдэхүүнийг идэвхжүүлэх үү?`
      case 'deactivate':
        return `${count} бүтээгдэхүүнийг идэвхгүй болгох уу?`
      case 'feature':
        return `${count} бүтээгдэхүүнийг онцлох болгох уу?`
      case 'unfeature':
        return `${count} бүтээгдэхүүнийг онцлохоос хасах уу?`
      case 'delete':
        return `${count} бүтээгдэхүүнийг устгах уу?`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Бүтээгдэхүүний удирдлага</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Нэр, SKU-ээр хайх..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Төлвөөр шүүх" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх төлөв</SelectItem>
                  <SelectItem value="active">Идэвхтэй</SelectItem>
                  <SelectItem value="inactive">Идэвхгүй</SelectItem>
                  <SelectItem value="draft">Ноорог</SelectItem>
                  <SelectItem value="out_of_stock">Дууссан</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ангилалаар шүүх" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх ангилал</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Худалдагчаар шүүх" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх худалдагч</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Онцлох шүүлт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  <SelectItem value="featured">Онцлох</SelectItem>
                  <SelectItem value="not_featured">Онцлох биш</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedProducts.length > 0 && (
            <div className="mb-4 flex items-center gap-4 rounded-lg bg-orange-50 p-4">
              <span className="text-sm font-medium text-orange-800">
                {selectedProducts.length} бүтээгдэхүүн сонгогдсон
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('activate')}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Идэвхжүүлэх
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('deactivate')}
                >
                  <Ban className="mr-1 h-4 w-4" />
                  Идэвхгүй болгох
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('feature')}
                >
                  <Star className="mr-1 h-4 w-4" />
                  Онцлох болгох
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('unfeature')}
                >
                  <StarOff className="mr-1 h-4 w-4" />
                  Онцлохоос хасах
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => openBulkActionDialog('delete')}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Устгах
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProducts([])}
                className="ml-auto"
              >
                Цуцлах
              </Button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Package className="mb-4 h-12 w-12 text-gray-300" />
              <p>Бүтээгдэхүүн олдсонгүй</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Бүтээгдэхүүн</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Худалдагч</TableHead>
                    <TableHead>Ангилал</TableHead>
                    <TableHead>Үнэ</TableHead>
                    <TableHead>Үлдэгдэл</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead>Онцлох</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(product.created_at)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">
                          {product.sku || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.seller_profiles?.store_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.categories?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatPrice(product.price || 0, 'MNT', 'mn-MN')}
                          </p>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(product.compare_at_price, 'MNT', 'mn-MN')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            (product.stock_quantity || 0) <= 0
                              ? 'text-red-600'
                              : (product.stock_quantity || 0) <= 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock_quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[product.status]?.color || 'bg-gray-100'}>
                          {statusConfig[product.status]?.label || product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.is_featured || false}
                          onCheckedChange={() =>
                            handleToggleFeatured(product.id, product.is_featured)
                          }
                          disabled={isPending}
                        />
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
                              onClick={() =>
                                window.open(`/seller/products/${product.id}/edit`, '_blank')
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Засах
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(`/products/${product.slug}`, '_blank')
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Дэлгүүрт харах
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {product.is_featured ? (
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(product.id, true)}
                              >
                                <StarOff className="mr-2 h-4 w-4" />
                                Онцлохоос хасах
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(product.id, false)}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Онцлох болгох
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {product.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(product.id, 'inactive')}
                                className="text-yellow-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Идэвхгүй болгох
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(product.id, 'active')}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Идэвхжүүлэх
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(product)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Устгах
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
                <p className="text-sm text-gray-500">Нийт {total} бүтээгдэхүүн</p>
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
                    disabled={products.length < 20}
                  >
                    Дараах
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бүтээгдэхүүн устгах</DialogTitle>
            <DialogDescription>
              &quot;{productToDelete?.name}&quot; бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?
              Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бөөнөөр үйлдэл хийх</DialogTitle>
            <DialogDescription>{getBulkActionMessage()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={isPending}
            >
              {isPending ? 'Хийж байна...' : 'Тийм'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
