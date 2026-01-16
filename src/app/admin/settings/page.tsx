'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Percent,
  DollarSign,
  Truck,
  Save,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  getPlatformSettings,
  updatePlatformSetting,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/actions/admin'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  created_at: string
}

export default function AdminSettingsPage() {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  // Platform settings
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({})

  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [settingsResult, categoriesResult] = await Promise.all([
      getPlatformSettings(),
      getAllCategories(),
    ])

    if ('settings' in settingsResult) {
      setSettings(settingsResult.settings || {})
      setEditedSettings(settingsResult.settings || {})
    }

    if ('categories' in categoriesResult) {
      setCategories(categoriesResult.categories || [])
    }

    setLoading(false)
  }

  const handleSaveSettings = async () => {
    startTransition(async () => {
      const changedKeys = Object.keys(editedSettings).filter(
        (key) => JSON.stringify(editedSettings[key]) !== JSON.stringify(settings[key])
      )

      for (const key of changedKeys) {
        const result = await updatePlatformSetting(key, editedSettings[key])
        if ('error' in result) {
          toast.error(`${key} хадгалахад алдаа гарлаа`)
          return
        }
      }

      setSettings(editedSettings)
      toast.success('Тохиргоо амжилттай хадгалагдлаа')
    })
  }

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_url: category.image_url || '',
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', slug: '', description: '', image_url: '' })
    }
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) {
      toast.error('Нэр болон slug заавал оруулна уу')
      return
    }

    startTransition(async () => {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, categoryForm)
        if ('error' in result) {
          toast.error(result.error)
        } else {
          toast.success('Ангилал амжилттай шинэчлэгдлээ')
          loadData()
        }
      } else {
        const result = await createCategory(categoryForm)
        if ('error' in result) {
          toast.error(result.error)
        } else {
          toast.success('Ангилал амжилттай үүсгэгдлээ')
          loadData()
        }
      }
      setCategoryDialogOpen(false)
    })
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    startTransition(async () => {
      const result = await deleteCategory(categoryToDelete.id)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Ангилал амжилттай устгагдлаа')
        loadData()
      }
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u0400-\u04FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  const hasChanges = JSON.stringify(editedSettings) !== JSON.stringify(settings)

  return (
    <div className="space-y-6">
      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Платформын тохиргоо
          </CardTitle>
          <CardDescription>Платформын үндсэн тохиргоонуудыг энд удирдана</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Platform Name */}
            <div className="space-y-2">
              <Label htmlFor="platform_name">Платформын нэр</Label>
              <Input
                id="platform_name"
                value={editedSettings.platform_name?.replace(/"/g, '') || ''}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    platform_name: `"${e.target.value}"`,
                  }))
                }
              />
            </div>

            {/* Default Currency */}
            <div className="space-y-2">
              <Label htmlFor="default_currency">Үндсэн валют</Label>
              <Input
                id="default_currency"
                value={editedSettings.default_currency?.replace(/"/g, '') || ''}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    default_currency: `"${e.target.value}"`,
                  }))
                }
              />
            </div>

            {/* Commission Rate */}
            <div className="space-y-2">
              <Label htmlFor="default_commission_rate" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Үндсэн комиссийн хувь (%)
              </Label>
              <Input
                id="default_commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editedSettings.default_commission_rate || '10'}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    default_commission_rate: e.target.value,
                  }))
                }
              />
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="tax_rate" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                НӨАТ-ийн хувь (%)
              </Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={editedSettings.tax_rate || '10'}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    tax_rate: e.target.value,
                  }))
                }
              />
            </div>

            {/* Min Payout Amount */}
            <div className="space-y-2">
              <Label htmlFor="min_payout_amount">Хамгийн бага төлбөрийн дүн (₮)</Label>
              <Input
                id="min_payout_amount"
                type="number"
                min="0"
                step="1000"
                value={editedSettings.min_payout_amount || '50000'}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    min_payout_amount: e.target.value,
                  }))
                }
              />
            </div>

            {/* Free Shipping Threshold */}
            <div className="space-y-2">
              <Label htmlFor="free_shipping_threshold" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Үнэгүй хүргэлтийн босго (₮)
              </Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                step="1000"
                value={editedSettings.free_shipping_threshold || '50000'}
                onChange={(e) =>
                  setEditedSettings((prev) => ({
                    ...prev,
                    free_shipping_threshold: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Categories Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Ангилалын удирдлага
            </CardTitle>
            <CardDescription>Бүтээгдэхүүний ангилалуудыг энд удирдана</CardDescription>
          </div>
          <Button onClick={() => handleOpenCategoryDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Шинэ ангилал
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500">
              <FolderTree className="mb-2 h-8 w-8 text-gray-300" />
              <p>Ангилал байхгүй</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Тайлбар</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-500">{category.slug}</TableCell>
                    <TableCell className="max-w-xs truncate text-gray-500">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenCategoryDialog(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setCategoryToDelete(category)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Ангилал засах' : 'Шинэ ангилал үүсгэх'}
            </DialogTitle>
            <DialogDescription>
              Ангилалын мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Нэр *</Label>
              <Input
                id="category_name"
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setCategoryForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name),
                  }))
                }}
                placeholder="Электроник"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_slug">Slug *</Label>
              <Input
                id="category_slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_description">Тайлбар</Label>
              <Textarea
                id="category_description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ангилалын тайлбар..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_image">Зургийн URL</Label>
              <Input
                id="category_image"
                value={categoryForm.image_url}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, image_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleSaveCategory} disabled={isPending}>
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ангилал устгах</DialogTitle>
            <DialogDescription>
              &quot;{categoryToDelete?.name}&quot; ангилалыг устгахдаа итгэлтэй байна уу?
              Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isPending}
            >
              {isPending ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
