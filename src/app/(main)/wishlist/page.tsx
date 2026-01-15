'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, Package, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      seller: item.seller,
    })
    toast.success('Сагсанд нэмэгдлээ')
    openCart()
  }

  const handleRemove = (id: string) => {
    removeItem(id)
    toast.success('Хадгалсан жагсаалтаас хасагдлаа')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Холбоос хуулагдлаа')
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-8">
            <Heart className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Хадгалсан жагсаалт хоосон байна</h1>
          <p className="mt-2 text-gray-500">
            Бүтээгдэхүүн дээрх зүрхэн дүрс дарж хадгална уу.
          </p>
          <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600">
            <Link href="/products">Бүтээгдэхүүн үзэх</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Хадгалсан ({items.length} {items.length === 1 ? 'бүтээгдэхүүн' : 'бүтээгдэхүүн'})
          </h1>
          <p className="mt-1 text-gray-500">
            Дараа авах гэж хадгалсан бүтээгдэхүүнүүд
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Хуваалцах
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              clearWishlist()
              toast.success('Жагсаалт цэвэрлэгдлээ')
            }}
          >
            Бүгдийг арилгах
          </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
          >
            {/* Remove Button */}
            <button
              onClick={() => handleRemove(item.id)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 text-gray-400 shadow-sm hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Product Image */}
            <Link href={`/products/${item.slug}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="mt-4">
              <p className="text-xs text-gray-500">{item.seller.storeName}</p>
              <Link href={`/products/${item.slug}`}>
                <h3 className="mt-1 line-clamp-2 font-medium text-gray-900 group-hover:text-orange-600">
                  {item.name}
                </h3>
              </Link>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
                {item.compareAtPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => handleAddToCart(item)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Сагсанд нэмэх
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
