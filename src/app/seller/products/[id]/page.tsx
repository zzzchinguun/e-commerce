'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { getProduct, updateProduct } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import { createClient } from '@/lib/supabase/client'

const productSchema = z.object({
  name: z.string().min(1, 'Бүтээгдэхүүний нэр шаардлагатай'),
  description: z.string().min(10, 'Тайлбар дор хаяж 10 тэмдэгтээс бүрдсэн байх ёстой'),
  shortDescription: z.string().optional(),
  price: z.number().min(0.01, 'Үнэ 0-ээс их байх ёстой'),
  compareAtPrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().min(0, 'Нөөц сөрөг байж болохгүй'),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']),
  trackInventory: z.boolean(),
  brand: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

type Category = {
  id: string
  name: string
  slug: string
  children?: { id: string; name: string; slug: string }[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
      trackInventory: true,
      stock: 0,
    },
  })

  const status = watch('status')
  const trackInventory = watch('trackInventory')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Load categories
      const categoriesResult = await getCategories()
      if (!categoriesResult.error && categoriesResult.categories) {
        setCategories(categoriesResult.categories)
      }
      setLoadingCategories(false)

      // Load product
      const productResult = await getProduct(productId)
      if (productResult.error) {
        toast.error(productResult.error)
        router.push('/seller/products')
        return
      }

      if (productResult.product) {
        const product = productResult.product as any
        const defaultVariant = product.product_variants?.[0]
        const inventory = defaultVariant?.inventory?.[0]

        // Set form values
        reset({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.short_description || '',
          price: product.base_price || 0,
          compareAtPrice: product.compare_at_price || undefined,
          sku: product.sku || '',
          barcode: product.barcode || '',
          stock: inventory?.quantity || 0,
          categoryId: product.category_id || undefined,
          status: product.status || 'draft',
          trackInventory: inventory?.track_inventory ?? true,
          brand: product.brand || '',
        })

        // Set images
        if (product.product_images && product.product_images.length > 0) {
          const sortedImages = product.product_images
            .sort((a: any, b: any) => a.position - b.position)
            .map((img: any) => img.url)
          setImages(sortedImages)
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [productId, router, reset])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const supabase = createClient()

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `product-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          return null
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter((url): url is string => url !== null)

      if (validUrls.length > 0) {
        setImages((prev) => [...prev, ...validUrls])
        toast.success(`${validUrls.length} зураг амжилттай байршуулагдлаа`)
      }

      if (validUrls.length < files.length) {
        toast.error(`${files.length - validUrls.length} зураг байршуулж чадсангүй`)
      }
    } catch (error) {
      toast.error('Зураг байршуулж чадсангүй')
      console.error('Upload error:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateProduct(
        productId,
        {
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          sku: data.sku,
          barcode: data.barcode,
          categoryId: data.categoryId,
          status: data.status,
          stock: data.stock,
          trackInventory: data.trackInventory,
          brand: data.brand,
        },
        images
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Бүтээгдэхүүн амжилттай шинэчлэгдлээ!')
        router.push('/seller/products')
      }
    } catch (error) {
      toast.error('Бүтээгдэхүүн шинэчлэхэд алдаа гарлаа')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүтээгдэхүүн засах</h1>
          <p className="text-gray-500">Бүтээгдэхүүний мэдээллийг шинэчлэх</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Үндсэн мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Бүтээгдэхүүний нэр *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Бүтээгдэхүүний нэрийг оруулна уу"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDescription">Товч тайлбар</Label>
                  <Input
                    id="shortDescription"
                    {...register('shortDescription')}
                    placeholder="Бүтээгдэхүүний товч тойм"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Тайлбар *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Бүтээгдэхүүнийг дэлгэрэнгүй тайлбарлана уу..."
                    rows={5}
                    className="mt-1"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brand">Брэнд</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    placeholder="жишээ нь: Nike, Apple, Samsung"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Зургууд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-50"
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                          Үндсэн
                        </span>
                      )}
                    </div>
                  ))}

                  <label className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50 ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploadingImages ? (
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Зураг байршуулах
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  8 хүртэлх зураг байршуулах боломжтой. Эхний зураг нь бүтээгдэхүүний үндсэн зураг болно.
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Үнэ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Үнэ *</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₮
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="compareAtPrice">Харьцуулах үнэ</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₮
                      </span>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        step="0.01"
                        {...register('compareAtPrice', { valueAsNumber: true })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Хямдралыг харуулах анхны үнэ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Нөөц</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Нөөцийг хянах</p>
                    <p className="text-sm text-gray-500">
                      Энэ бүтээгдэхүүний нөөцийн түвшинг хянах
                    </p>
                  </div>
                  <Switch
                    checked={trackInventory}
                    onCheckedChange={(checked) =>
                      setValue('trackInventory', checked)
                    }
                  />
                </div>

                {trackInventory && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="stock">Нөөцийн тоо хэмжээ *</Label>
                        <Input
                          id="stock"
                          type="number"
                          {...register('stock', { valueAsNumber: true })}
                          className="mt-1"
                        />
                        {errors.stock && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.stock.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          {...register('sku')}
                          placeholder="e.g., WBH-001"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="barcode">Баркод</Label>
                        <Input
                          id="barcode"
                          {...register('barcode')}
                          placeholder="e.g., 123456789"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Төлөв</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={status}
                  onValueChange={(value: 'draft' | 'active' | 'inactive') =>
                    setValue('status', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Төлөв сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Ноорог</SelectItem>
                    <SelectItem value="active">Идэвхтэй (Дэлгүүрт харагдана)</SelectItem>
                    <SelectItem value="inactive">Идэвхгүй</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-gray-500">
                  Ноорог бүтээгдэхүүнүүд хэрэглэгчдэд харагдахгүй.
                </p>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Ангилал</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                  </div>
                ) : (
                  <Select
                    value={watch('categoryId')}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ангилал сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <div key={category.id}>
                          <SelectItem value={category.id}>
                            {category.name}
                          </SelectItem>
                          {category.children?.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              &nbsp;&nbsp;└ {child.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isSubmitting || uploadingImages}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Хадгалах
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/seller/products')}
                  >
                    Цуцлах
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
