import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Marketplace account password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
