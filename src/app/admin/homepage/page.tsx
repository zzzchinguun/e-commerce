'use client'

import { useState, useEffect } from 'react'
import {
  Image,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Laptop,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  Car,
  BookOpen,
  Gamepad2,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  getHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  type HeroBanner,
} from '@/actions/homepage'

// Default banners (used when no database banners exist)
const defaultBanners = [
  {
    id: 'default-1',
    title: 'Хамгийн сүүлийн үеийн электроник',
    subtitle: 'Хамгийн сүүлийн үеийн гаджет, техникийн хямдралыг олж мэдээрэй',
    cta_text: 'Электроник үзэх',
    cta_link: '/products?category=electronics',
    bg_color: 'from-blue-600 to-blue-800',
    is_active: true,
    display_order: 0,
  },
  {
    id: 'default-2',
    title: 'Бүгдэд зориулсан загвар',
    subtitle: 'Хувцас, гоёл чимэглэлийн шинэ бүтээгдэхүүнүүд',
    cta_text: 'Загвар үзэх',
    cta_link: '/products?category=fashion',
    bg_color: 'from-purple-600 to-purple-800',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'default-3',
    title: 'Гэр & Амьдралын хэрэгцээ',
    subtitle: 'Чанартай бүтээгдэхүүнээр орон зайгаа хувиргаарай',
    cta_text: 'Гэр ахуй үзэх',
    cta_link: '/products?category=home-garden',
    bg_color: 'from-green-600 to-green-800',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'default-4',
    title: 'MSTORE-д зараарай',
    subtitle: 'Сая сая худалдан авагчдад хүрч, бизнесээ өргөжүүлээрэй',
    cta_text: 'Зарж эхлэх',
    cta_link: '/seller/register',
    bg_color: 'from-orange-500 to-orange-700',
    is_active: true,
    display_order: 3,
  },
]

// Gradient options
const gradientOptions = [
  { value: 'from-blue-600 to-blue-800', label: 'Цэнхэр', preview: 'bg-gradient-to-r from-blue-600 to-blue-800' },
  { value: 'from-purple-600 to-purple-800', label: 'Нил ягаан', preview: 'bg-gradient-to-r from-purple-600 to-purple-800' },
  { value: 'from-green-600 to-green-800', label: 'Ногоон', preview: 'bg-gradient-to-r from-green-600 to-green-800' },
  { value: 'from-orange-500 to-orange-700', label: 'Улбар шар', preview: 'bg-gradient-to-r from-orange-500 to-orange-700' },
  { value: 'from-red-500 to-red-700', label: 'Улаан', preview: 'bg-gradient-to-r from-red-500 to-red-700' },
  { value: 'from-pink-500 to-pink-700', label: 'Ягаан', preview: 'bg-gradient-to-r from-pink-500 to-pink-700' },
  { value: 'from-slate-700 to-slate-900', label: 'Саарал', preview: 'bg-gradient-to-r from-slate-700 to-slate-900' },
]

// Default categories (static)
const defaultCategories = [
  { name: 'Электроник', slug: 'electronics', icon: 'Laptop', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Загвар', slug: 'fashion', icon: 'Shirt', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'Гэр & Цэцэрлэг', slug: 'home-garden', icon: 'Home', color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Эрүүл мэнд & Гоо сайхан', slug: 'health-beauty', icon: 'Heart', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { name: 'Спорт', slug: 'sports-outdoors', icon: 'Dumbbell', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Автомашин', slug: 'automotive', icon: 'Car', color: 'text-slate-600', bgColor: 'bg-slate-50' },
  { name: 'Ном', slug: 'books-media', icon: 'BookOpen', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { name: 'Тоглоом', slug: 'toys-games', icon: 'Gamepad2', color: 'text-red-600', bgColor: 'bg-red-50' },
]

const iconMap: Record<string, LucideIcon> = {
  Laptop,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  Car,
  BookOpen,
  Gamepad2,
}

type BannerFormData = {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  bg_color: string
}

export default function HomepageManagementPage() {
  const [banners, setBanners] = useState<(HeroBanner | typeof defaultBanners[0])[]>(defaultBanners)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingBanner, setEditingBanner] = useState<(HeroBanner | typeof defaultBanners[0]) | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    bg_color: gradientOptions[0].value,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    setLoading(true)
    const result = await getHeroBanners()
    if (result.banners && result.banners.length > 0) {
      setBanners(result.banners)
    }
    // Keep default banners if none in database
    setLoading(false)
  }

  function openEditDialog(banner: typeof banners[0]) {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      bg_color: banner.bg_color,
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      bg_color: gradientOptions[0].value,
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.title || !formData.cta_text || !formData.cta_link) {
      toast.error('Гарчиг, товч текст, товч линк шаардлагатай')
      return
    }

    setSaving(true)

    try {
      if (editingBanner && !editingBanner.id.startsWith('default-')) {
        // Update existing
        const result = await updateHeroBanner(editingBanner.id, formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Баннер шинэчлэгдлээ')
          fetchBanners()
          setIsDialogOpen(false)
        }
      } else {
        // Create new
        const result = await createHeroBanner(formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Баннер нэмэгдлээ')
          fetchBanners()
          setIsDialogOpen(false)
        }
      }
    } catch (error) {
      toast.error('Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (id.startsWith('default-')) {
      toast.error('Үндсэн баннеруудыг устгах боломжгүй')
      return
    }

    if (!confirm('Энэ баннерийг устгах уу?')) return

    const result = await deleteHeroBanner(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Баннер устгагдлаа')
      fetchBanners()
    }
  }

  async function handleToggleActive(banner: typeof banners[0]) {
    if (banner.id.startsWith('default-')) {
      toast.error('Үндсэн баннеруудыг өөрчлөх боломжгүй. Шинэ баннер нэмнэ үү.')
      return
    }

    const result = await updateHeroBanner(banner.id, { is_active: !banner.is_active })
    if (result.error) {
      toast.error(result.error)
    } else {
      fetchBanners()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Нүүр хуудас удирдах</h1>
          <p className="text-gray-500">Баннер болон ангилалыг тохируулах</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Мэдээлэл</p>
            <p className="mt-1 text-blue-700">
              Баннер болон ангилалын өөрчлөлт хийхийн тулд эхлээд өгөгдлийн санд хүснэгт үүсгэх шаардлагатай.
              Доорх SQL кодыг Supabase-д ажиллуулна уу.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hero Banners Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-orange-500" />
              Hero баннерууд
            </CardTitle>
            <CardDescription>
              Нүүр хуудсанд харагдах слайдер баннерууд
            </CardDescription>
          </div>
          <Button onClick={openNewDialog} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" />
            Шинэ баннер
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 ${
                    banner.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Preview */}
                  <div
                    className={`h-16 w-28 shrink-0 rounded-lg bg-gradient-to-r ${banner.bg_color} flex items-center justify-center`}
                  >
                    <span className="text-xs text-white/80">Баннер {index + 1}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{banner.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {banner.cta_text}
                      </Badge>
                      {!banner.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Идэвхгүй
                        </Badge>
                      )}
                      {banner.id.startsWith('default-') && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                          Үндсэн
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(banner)}
                      title={banner.is_active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                    >
                      {banner.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!banner.id.startsWith('default-') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-orange-500" />
            Онцлох ангилалууд
          </CardTitle>
          <CardDescription>
            Нүүр хуудсанд харагдах ангилалууд (одоогоор статик)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {defaultCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || Laptop
              return (
                <div
                  key={category.slug}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${category.bgColor}`}
                >
                  <div className={`rounded-full bg-white p-2 ${category.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Ангилалуудыг өөрчлөхийн тулд <code className="rounded bg-gray-100 px-1">CategoryGrid.tsx</code> файлыг засна уу.
          </p>
        </CardContent>
      </Card>

      {/* SQL Code for reference */}
      <Card>
        <CardHeader>
          <CardTitle>Өгөгдлийн сан тохируулах</CardTitle>
          <CardDescription>
            Баннер удирдахын тулд доорх SQL кодыг Supabase SQL Editor дээр ажиллуулна уу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
{`-- Hero Banners table
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    bg_color TEXT NOT NULL DEFAULT 'from-blue-600 to-blue-800',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
    ON public.hero_banners FOR SELECT
    USING (is_active = TRUE);

-- Admins can manage banners
CREATE POLICY "Admins can manage banners"
    ON public.hero_banners FOR ALL
    USING (public.is_admin());`}
          </pre>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              navigator.clipboard.writeText(`-- Hero Banners table
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    bg_color TEXT NOT NULL DEFAULT 'from-blue-600 to-blue-800',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
    ON public.hero_banners FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage banners"
    ON public.hero_banners FOR ALL
    USING (public.is_admin());`)
              toast.success('SQL код хуулагдлаа')
            }}
          >
            SQL код хуулах
          </Button>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Баннер засах' : 'Шинэ баннер'}
            </DialogTitle>
            <DialogDescription>
              Баннерийн мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            <div
              className={`h-24 rounded-lg bg-gradient-to-r ${formData.bg_color} flex items-center justify-center p-4`}
            >
              <div className="text-center text-white">
                <p className="font-bold">{formData.title || 'Гарчиг'}</p>
                <p className="text-sm text-white/80">{formData.subtitle || 'Дэд гарчиг'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Гарчиг</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Баннерийн гарчиг"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Дэд гарчиг</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Баннерийн тайлбар"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Товч текст</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="Үзэх"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">Товч линк</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="/products"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Өнгө</Label>
              <div className="grid grid-cols-4 gap-2">
                {gradientOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`h-10 rounded-lg ${option.preview} ${
                      formData.bg_color === option.value
                        ? 'ring-2 ring-orange-500 ring-offset-2'
                        : ''
                    }`}
                    onClick={() => setFormData({ ...formData, bg_color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Хадгалах
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
