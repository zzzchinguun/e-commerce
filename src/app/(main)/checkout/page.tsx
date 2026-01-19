'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Container } from '@/components/layout/Container'

export default function CheckoutPage() {
  const { items, getSubtotal } = useCartStore()
  const subtotal = getSubtotal()

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-8">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Таны сагс хоосон байна</h1>
          <p className="mt-2 text-gray-500">
            Төлбөр төлөхийн тулд сагсандаа бараа нэмнэ үү.
          </p>
          <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600">
            <Link href="/products">Худалдаа үргэлжлүүлэх</Link>
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Сагс руу буцах
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">Төлбөр төлөх</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Checkout Form */}
        <div className="order-2 lg:order-1">
          <CheckoutForm items={items} subtotal={subtotal} />
        </div>

        {/* Order Items */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-24 rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Таны захиалга ({items.length} {items.length === 1 ? 'бараа' : 'бараа'})
            </h2>

            <div className="mt-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="line-clamp-1 text-sm font-medium text-gray-900">
                        {item.product.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.product.seller.storeName}
                      </span>
                      {item.variantOptions && (
                        <span className="text-xs text-gray-500">
                          {Object.entries(item.variantOptions)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <Link
              href="/cart"
              className="text-sm text-orange-600 hover:underline"
            >
              Сагс засах
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
