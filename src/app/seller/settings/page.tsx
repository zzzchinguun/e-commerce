'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Loader2,
  Upload,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const storeSchema = z.object({
  storeName: z.string().min(1, 'Дэлгүүрийн нэр шаардлагатай'),
  description: z.string().optional(),
  email: z.string().email('И-мэйл хаяг буруу байна'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

type StoreInput = z.infer<typeof storeSchema>

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderUpdate: true,
    lowStock: true,
    reviews: false,
    marketing: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreInput>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: 'My Store',
      description: 'Quality products at great prices',
      email: 'seller@example.com',
      phone: '+1 234 567 8900',
      address: '123 Main Street',
      city: 'New York, NY 10001',
      country: 'United States',
    },
  })

  const onSubmit = async (data: StoreInput) => {
    setIsSubmitting(true)
    try {
      // TODO: Save to Supabase
      console.log('Store settings:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Тохиргоо амжилттай хадгалагдлаа!')
    } catch (error) {
      toast.error('Тохиргоо хадгалж чадсангүй')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тохиргоо</h1>
        <p className="text-gray-500">Дэлгүүрийн тохиргоо болон сонголтуудыг удирдах</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-gray-500" />
              <CardTitle>Дэлгүүрийн мэдээлэл</CardTitle>
            </div>
            <CardDescription>
              Энэ мэдээлэл таны дэлгүүрийн нүүр хуудсанд харагдана
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Store className="h-10 w-10" />
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 p-2 text-white shadow-sm hover:bg-orange-600"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900">Дэлгүүрийн лого</p>
                <p className="text-sm text-gray-500">
                  JPG, PNG эсвэл GIF. Дээд тал нь 2MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="storeName">Дэлгүүрийн нэр *</Label>
                <Input
                  id="storeName"
                  {...register('storeName')}
                  className="mt-1"
                />
                {errors.storeName && (
                  <p className="mt-1 text-sm text-red-500">{errors.storeName.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Дэлгүүрийн тайлбар</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1"
                  placeholder="Дэлгүүрийнхээ тухай хэрэглэгчдэд хэлнэ үү..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <CardTitle>Холбоо барих мэдээлэл</CardTitle>
            </div>
            <CardDescription>
              Хэрэглэгчид тантай хэрхэн холбогдох вэ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">И-мэйл *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Утас</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Хаяг</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="address"
                    {...register('address')}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">Хот, Дүүрэг, Зип код</Label>
                <Input
                  id="city"
                  {...register('city')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country">Улс</Label>
                <Input
                  id="country"
                  {...register('country')}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <CardTitle>Төлбөрийн тохиргоо</CardTitle>
            </div>
            <CardDescription>
              Төлбөр хүлээн авах аргуудыг удирдах
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">Stripe Connect</p>
                    <Badge className="bg-green-100 text-green-700">Холбогдсон</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Төлбөрийг шууд банкны данс руу хүлээн авах
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Удирдах
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <CardTitle>Мэдэгдлүүд</CardTitle>
            </div>
            <CardDescription>
              Шинэчлэлтүүдийг хэрхэн хүлээн авахыг тохируулах
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'newOrder',
                title: 'Шинэ захиалгууд',
                description: 'Шинэ захиалга ирэхэд мэдэгдэл авах',
              },
              {
                key: 'orderUpdate',
                title: 'Захиалгын шинэчлэлтүүд',
                description: 'Захиалгын төлөв өөрчлөгдөхөд мэдэгдэл',
              },
              {
                key: 'lowStock',
                title: 'Нөөц бага байгаа сэрэмжлүүлэг',
                description: 'Бүтээгдэхүүний нөөц бага үлдэхэд сэрэмжлүүлэг авах',
              },
              {
                key: 'reviews',
                title: 'Бүтээгдэхүүний сэтгэгдлүүд',
                description: 'Хэрэглэгчид сэтгэгдэл үлдээхэд мэдэгдэл',
              },
              {
                key: 'marketing',
                title: 'Маркетинг ба зөвлөмж',
                description: 'Худалдагчийн зөвлөмж ба сурталчилгааны боломжуудыг авах',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" />
              <CardTitle>Аюулгүй байдал</CardTitle>
            </div>
            <CardDescription>
              Бүртгэлээ хамгаалах
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Хоёр хүчин зүйлийн баталгаажуулалт</p>
                <p className="text-sm text-gray-500">
                  Бүртгэлдээ нэмэлт хамгаалалтын давхарга нэмэх
                </p>
              </div>
              <Button variant="outline" size="sm">
                Идэвхжүүлэх
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Нууц үг солих</p>
                <p className="text-sm text-gray-500">
                  Аюулгүй байдлыг сайжруулахын тулд нууц үгээ тогтмол шинэчлэх
                </p>
              </div>
              <Button variant="outline" size="sm">
                Шинэчлэх
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Цуцлах
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Өөрчлөлтийг хадгалах
          </Button>
        </div>
      </form>
    </div>
  )
}
