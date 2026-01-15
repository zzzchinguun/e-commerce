'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<'not_found' | 'found' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulate search
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo, always show not found (real implementation would query database)
    setSearchResult('not_found')
    setIsSearching(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        <p className="mt-2 text-gray-600">
          Enter your order number and email to see the current status of your order
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              placeholder="e.g., ORD-12345678"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              You can find this in your order confirmation email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="The email used for your order"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Track Order
              </>
            )}
          </Button>
        </form>

        {searchResult === 'not_found' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              No order found with those details. Please check your order number and email.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              If you have an account, you can also{' '}
              <Link href="/account/orders" className="text-orange-600 hover:underline">
                view your orders
              </Link>{' '}
              after logging in.
            </p>
          </div>
        )}
      </div>

      {/* Order Status Guide */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Guide</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Processing</h3>
              <p className="text-sm text-gray-600">Your order has been received and is being prepared</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Shipped</h3>
              <p className="text-sm text-gray-600">Your order has been handed to the shipping carrier</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Out for Delivery</h3>
              <p className="text-sm text-gray-600">Your order is on its way to your address</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Delivered</h3>
              <p className="text-sm text-gray-600">Your order has been delivered successfully</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-orange-50 rounded-lg p-6 text-center">
        <h2 className="font-semibold text-gray-900">Need Help?</h2>
        <p className="mt-1 text-sm text-gray-600">
          If you have questions about your order, our support team is here to help.
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block text-orange-600 hover:underline"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
