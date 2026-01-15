'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear the cart after successful checkout
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>

        <p className="mt-2 text-gray-600">
          Thank you for your purchase. We&apos;ve sent a confirmation email with your order details.
        </p>

        {sessionId && (
          <p className="mt-4 text-sm text-gray-500">
            Order ID: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="mt-8 rounded-lg border bg-gray-50 p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-orange-500" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">What happens next?</h3>
              <p className="text-sm text-gray-500">
                You&apos;ll receive shipping updates via email as your order is processed and shipped.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/account/orders">View Order</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/products" className="flex items-center gap-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
