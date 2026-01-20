'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, Shield, Bell, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog'
import type { User } from '@supabase/supabase-js'

const profileSchema = z.object({
  fullName: z.string().min(1, 'Нэр оруулна уу'),
  email: z.string().email(),
  phone: z.string().optional(),
})

type ProfileInput = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: false,
    newsletter: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        reset({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        })
      }
      setLoading(false)
    }
    getUser()
  }, [reset])

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      })

      if (error) throw error
      toast.success('Профайл амжилттай шинэчлэгдлээ')
    } catch (error) {
      toast.error('Профайл шинэчлэхэд алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <Skeleton className="h-6 w-32" />
          <div className="mt-6 flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Профайл тохиргоо</h2>

        {/* Avatar */}
        <div className="mt-6 flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" disabled>
            <Camera className="mr-2 h-4 w-4" />
            Зураг солих
          </Button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Бүтэн нэр</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                className="mt-1"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">Имэйл өөрчлөх боломжгүй</p>
            </div>
          </div>
          <div className="sm:w-1/2">
            <Label htmlFor="phone">Утасны дугаар</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-1"
              placeholder="(99) 12-34-56-78"
            />
          </div>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Өөрчлөлт хадгалах
          </Button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Мэдэгдэл</h2>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Захиалгын мэдээлэл</p>
              <p className="text-sm text-gray-500">
                Захиалгын төлөвийн талаар мэдэгдэл авах
              </p>
            </div>
            <Switch
              checked={notifications.orders}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, orders: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Урамшуулал & Хямдрал</p>
              <p className="text-sm text-gray-500">
                Онцгой санал болон хямдралын мэдээлэл авах
              </p>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, promotions: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Мэдээллийн товхимол</p>
              <p className="text-sm text-gray-500">
                Шинэ бүтээгдэхүүний долоо хоногийн мэдээлэл
              </p>
            </div>
            <Switch
              checked={notifications.newsletter}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, newsletter: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Аюулгүй байдал</h2>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Нууц үг</p>
              <p className="text-sm text-gray-500">
                Бүртгэлийн нууц үгээ солих
              </p>
            </div>
            <ChangePasswordDialog />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Холбогдсон бүртгэлүүд</p>
              <p className="text-sm text-gray-500">
                {user?.app_metadata?.provider === 'google'
                  ? 'Google-ээр холбогдсон'
                  : 'Холбогдсон бүртгэл байхгүй'}
              </p>
            </div>
            <Button variant="outline" disabled>
              Удирдах
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-700">Аюултай бүс</h2>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Бүртгэлээ устгасны дараа буцаах боломжгүй. Сайн бодоорой.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              Бүртгэл устгах
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Та итгэлтэй байна уу?</AlertDialogTitle>
              <AlertDialogDescription>
                Энэ үйлдлийг буцаах боломжгүй. Таны бүртгэл болон бүх өгөгдөл
                серверээс бүрмөсөн устгагдана.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                Бүртгэл устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
