'use client'

import Link from 'next/link'
import { CheckCircle, Mail, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SellerRegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            MarketHub
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="mb-6 rounded-full bg-green-100 p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Application Submitted!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Thank you for your interest in becoming a seller on MarketHub.
          We&apos;ve received your application and our team will review it shortly.
        </p>

        <Card className="mt-8 w-full">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900">What happens next?</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  1
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Application Review</p>
                  <p className="text-sm text-gray-500">
                    Our team will review your application within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  2
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Email Confirmation</p>
                  <p className="text-sm text-gray-500">
                    You&apos;ll receive an email once your account is approved.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  3
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Set Up Payments</p>
                  <p className="text-sm text-gray-500">
                    Connect your Stripe account to start receiving payments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  4
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Start Selling!</p>
                  <p className="text-sm text-gray-500">
                    List your first product and start earning.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">
              <Mail className="mr-2 h-4 w-4" />
              Check Email
            </Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Average approval time: 24 hours</span>
        </div>
      </div>
    </div>
  )
}
