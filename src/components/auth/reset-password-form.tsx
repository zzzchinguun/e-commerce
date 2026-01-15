'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      .regex(/[A-Z]/, 'Нууц үг дор хаяж нэг том үсэг агуулсан байх ёстой')
      .regex(/[a-z]/, 'Нууц үг дор хаяж нэг жижиг үсэг агуулсан байх ёстой')
      .regex(/[0-9]/, 'Нууц үг дор хаяж нэг тоо агуулсан байх ёстой'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirmPassword'],
  })

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Нууц үг амжилттай шинэчлэгдлээ!')
      router.push('/login')
    } catch (error) {
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Шинэ нууц үг</Label>
        <Input
          id="password"
          type="password"
          placeholder="Шинэ нууц үгээ оруулна уу"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}

        {/* Password strength indicators */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1 text-xs">
            <p className={hasMinLength ? 'text-green-600' : 'text-gray-500'}>
              {hasMinLength ? '✓' : '○'} Хамгийн багадаа 8 тэмдэгт
            </p>
            <p className={hasUppercase ? 'text-green-600' : 'text-gray-500'}>
              {hasUppercase ? '✓' : '○'} Нэг том үсэг
            </p>
            <p className={hasLowercase ? 'text-green-600' : 'text-gray-500'}>
              {hasLowercase ? '✓' : '○'} Нэг жижиг үсэг
            </p>
            <p className={hasNumber ? 'text-green-600' : 'text-gray-500'}>
              {hasNumber ? '✓' : '○'} Нэг тоо
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Шинэ нууц үг баталгаажуулах</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Шинэ нууц үгээ баталгаажуулна уу"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Нууц үг шинэчлэх
      </Button>
    </form>
  )
}
