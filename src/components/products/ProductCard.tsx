'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  image?: string | null
  rating?: number
  reviewCount?: number
  seller: {
    storeName: string
  }
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()

  const isInWishlist = wishlistItems.some((item) => item.id === product.id)
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image || '',
      seller: {
        id: '',
        storeName: product.seller.storeName,
        storeSlug: '',
      },
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image || '',
        seller: {
          id: '',
          storeName: product.seller.storeName,
          storeSlug: '',
        },
      })
    }
  }

  return (
    <div className={cn('group relative flex flex-col', className)}>
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Package className="h-12 w-12" />
            </div>
          )}

          {/* Discount Badge */}
          {discount && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm transition-colors',
              isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
          </Button>

          {/* Quick Add to Cart - shows on hover */}
          <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-3 flex flex-1 flex-col">
          {/* Seller */}
          <p className="text-xs text-gray-500">{product.seller.storeName}</p>

          {/* Name */}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-orange-600">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount?.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
