import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Нэвтрэх',
  description: 'Marketplace бүртгэлдээ нэвтрэх',
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Тавтай морил</h1>
          <p className="mt-2 text-sm text-gray-600">
            Үргэлжлүүлэхийн тулд бүртгэлдээ нэвтэрнэ үү
          </p>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Бүртгэл байхгүй юу? </span>
          <Link
            href="/signup"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          Нэвтрэснээр та манай{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Үйлчилгээний нөхцөл
          </Link>{' '}
          болон{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Нууцлалын бодлого
          </Link>-г зөвшөөрч байна
        </p>
      </div>
    </div>
  )
}
