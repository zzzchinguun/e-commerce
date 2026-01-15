'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from './google-auth-button'

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const password = watch('password', '')

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  async function onSubmit(data: SignUpInput) {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        setEmailSent(true)
      } else {
        toast.success('Бүртгэл амжилттай үүслээ!')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message if email was sent
  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Имэйлээ шалгана уу</h3>
        <p className="mt-2 text-sm text-gray-600">
          Таны имэйл хаяг руу баталгаажуулах холбоос илгээлээ. Бүртгэлээ
          баталгаажуулахын тулд холбоос дээр дарна уу.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setEmailSent(false)}
        >
          Өөр имэйл ашиглах
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Эсвэл</span>
        </div>
      </div>

      {/* Email/Password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Бүтэн нэр</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Бат Болд"
            autoComplete="name"
            disabled={isLoading}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Имэйл</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Нууц үг</Label>
          <Input
            id="password"
            type="password"
            placeholder="Нууц үг үүсгэх"
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
              <p
                className={
                  hasMinLength ? 'text-green-600' : 'text-gray-500'
                }
              >
                {hasMinLength ? '✓' : '○'} Хамгийн багадаа 8 тэмдэгт
              </p>
              <p
                className={
                  hasUppercase ? 'text-green-600' : 'text-gray-500'
                }
              >
                {hasUppercase ? '✓' : '○'} Нэг том үсэг
              </p>
              <p
                className={
                  hasLowercase ? 'text-green-600' : 'text-gray-500'
                }
              >
                {hasLowercase ? '✓' : '○'} Нэг жижиг үсэг
              </p>
              <p
                className={hasNumber ? 'text-green-600' : 'text-gray-500'}
              >
                {hasNumber ? '✓' : '○'} Нэг тоо
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Бүртгэл үүсгэх
        </Button>
      </form>
    </div>
  )
}
