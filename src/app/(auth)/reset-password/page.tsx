import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Нууц үг сэргээх',
  description: 'Marketplace бүртгэлдээ шинэ нууц үг үүсгэх',
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Шинэ нууц үг үүсгэх
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Доор шинэ нууц үгээ оруулна уу.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
