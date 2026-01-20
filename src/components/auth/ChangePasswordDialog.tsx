'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Одоогийн нууц үгээ оруулна уу'),
    newPassword: z
      .string()
      .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      .regex(/[A-Z]/, 'Нууц үг нэг том үсэг агуулсан байх ёстой')
      .regex(/[a-z]/, 'Нууц үг нэг жижиг үсэг агуулсан байх ёстой')
      .regex(/[0-9]/, 'Нууц үг нэг тоо агуулсан байх ёстой'),
    confirmPassword: z.string().min(1, 'Нууц үгээ баталгаажуулна уу'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirmPassword'],
  })

type PasswordInput = z.infer<typeof passwordSchema>

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode
}

export function ChangePasswordDialog({ trigger }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordInput) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // First, verify the current password by trying to sign in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error('Хэрэглэгчийн мэдээлэл олдсонгүй')
        return
      }

      // Try to re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        toast.error('Одоогийн нууц үг буруу байна')
        return
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        toast.error(updateError.message || 'Нууц үг солиход алдаа гарлаа')
        return
      }

      toast.success('Нууц үг амжилттай солигдлоо!')
      reset()
      setOpen(false)
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Нууц үг солиход алдаа гарлаа')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Нууц үг солих
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Нууц үг солих
          </DialogTitle>
          <DialogDescription>
            Бүртгэлийн аюулгүй байдлыг хангахын тулд нууц үгээ тогтмол солих нь зүйтэй.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Шинэ нууц үг</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Хамгийн багадаа 8 тэмдэгт, нэг том үсэг, нэг жижиг үсэг, нэг тоо
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Шинэ нууц үг баталгаажуулах</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Цуцлах
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Нууц үг солих
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
