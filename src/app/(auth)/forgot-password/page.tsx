import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Нууц үг мартсан',
  description: 'Marketplace бүртгэлийн нууц үгээ сэргээх',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Нууц үг сэргээх</h1>
          <p className="mt-2 text-sm text-gray-600">
            Имэйл хаягаа оруулна уу, бид танд нууц үг сэргээх холбоос илгээх
            болно.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Нэвтрэх хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  )
}
