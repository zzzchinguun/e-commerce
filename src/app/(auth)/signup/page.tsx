import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Бүртгүүлэх',
  description: 'Marketplace бүртгэл үүсгэх',
}

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Бүртгэл үүсгэх</h1>
          <p className="mt-2 text-sm text-gray-600">
            Мянга мянган сэтгэл ханамжтай хэрэглэгчидтэй нэгдээрэй
          </p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Бүртгэлтэй юу? </span>
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Нэвтрэх
          </Link>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          Бүртгүүлснээр та манай{' '}
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
