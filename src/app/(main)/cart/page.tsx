'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = subtotal > 50 ? 0 : 4.99
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-8">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Таны сагс хоосон байна</h1>
          <p className="mt-2 text-gray-500">
            Та одоогоор сагсандаа бараа нэмээгүй байна.
          </p>
          <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600">
            <Link href="/products">Худалдаа үргэлжлүүлэх</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Худалдааны сагс ({items.length} {items.length === 1 ? 'бараа' : 'бараа'})
        </h1>
        <Button variant="ghost" className="text-red-500 hover:text-red-600" onClick={clearCart}>
          Сагс хоослох
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white">
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 md:p-6">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-32 md:w-32"
                  >
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium text-gray-900 hover:text-orange-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          Худалдагч: {item.product.seller.storeName}
                        </p>
                        {item.variantOptions && (
                          <p className="mt-1 text-sm text-gray-500">
                            {Object.entries(item.variantOptions)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-900 md:hidden">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Price - Desktop */}
                        <span className="hidden text-lg font-bold text-gray-900 md:block">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping Link */}
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-2 text-sm text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Худалдаа үргэлжлүүлэх
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Захиалгын хураангуй</h2>

            {/* Promo Code */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Промо код</label>
              <div className="mt-1 flex gap-2">
                <Input placeholder="Код оруулах" className="flex-1" />
                <Button variant="outline">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Нийт дүн</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Хүргэлт</span>
                <span className="text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-green-600">ҮНЭГҮЙ</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Татвар (тооцоолсон)</span>
                <span className="text-gray-900">{formatPrice(tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Нийт</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
            </div>

            {shipping === 0 && (
              <p className="mt-2 text-sm text-green-600">
                Та үнэгүй хүргэлтэнд хамрагдлаа!
              </p>
            )}

            {subtotal < 50 && (
              <p className="mt-2 text-sm text-gray-500">
                Үнэгүй хүргэлтэнд {formatPrice(50 - subtotal)} нэмнэ үү
              </p>
            )}

            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600"
            >
              <Link href="/checkout">Төлбөр төлөх</Link>
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
              <span>Аюулгүй төлбөр</span>
              <span>•</span>
              <span>30 хоногийн буцаалт</span>
              <span>•</span>
              <span>24/7 Тусламж</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
