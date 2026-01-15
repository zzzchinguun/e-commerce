'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Heart, Share2, Shield, Truck, RotateCcw, Minus, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface ProductVariant {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  stock: number
  options: Record<string, string>
}

interface Seller {
  id: string
  storeName: string
  storeSlug: string
  rating?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number | null
  rating?: number
  reviewCount?: number
  stock: number
  images: string[]
  seller: Seller
  variants?: ProductVariant[]
  options?: {
    name: string
    values: string[]
  }[]
}

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()

  const isInWishlist = wishlistItems.some((item) => item.id === product.id)

  // Find selected variant based on options
  const selectedVariant = product.variants?.find((variant) =>
    Object.entries(selectedOptions).every(
      ([key, value]) => variant.options[key] === value
    )
  )

  const currentPrice = selectedVariant?.price ?? product.price
  const currentCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice
  const currentStock = selectedVariant?.stock ?? product.stock

  const discount = currentCompareAtPrice
    ? Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)
    : null

  const isOutOfStock = currentStock === 0

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
  }

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice,
        image: product.images[0] || '',
        seller: {
          id: product.seller.id,
          storeName: product.seller.storeName,
          storeSlug: product.seller.storeSlug,
        },
      },
      quantity,
      selectedVariant?.id,
      selectedVariant ? selectedOptions : undefined
    )
    toast.success('Сагсанд нэмэгдлээ')
    openCart()
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Navigate to checkout
    window.location.href = '/checkout'
  }

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id)
      toast.success('Хадгалсан жагсаалтаас хасагдлаа')
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice,
        image: product.images[0] || '',
        seller: {
          id: product.seller.id,
          storeName: product.seller.storeName,
          storeSlug: product.seller.storeSlug,
        },
      })
      toast.success('Хадгалсан жагсаалтанд нэмэгдлээ')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Холбоос хуулагдлаа')
  }

  return (
    <div className="space-y-6">
      {/* Seller Info */}
      <div>
        <Link
          href={`/sellers/${product.seller.storeSlug}`}
          className="text-sm text-orange-600 hover:underline"
        >
          {product.seller.storeName} дэлгүүрт зочлох
        </Link>
      </div>

      {/* Product Name */}
      <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{product.name}</h1>

      {/* Rating */}
      {product.rating !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-5 w-5',
                  i < Math.floor(product.rating!)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="font-medium text-gray-900">{product.rating}</span>
          <Link href="#reviews" className="text-sm text-orange-600 hover:underline">
            {product.reviewCount?.toLocaleString()} сэтгэгдэл
          </Link>
        </div>
      )}

      <Separator />

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(currentPrice)}
          </span>
          {currentCompareAtPrice && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(currentCompareAtPrice)}
              </span>
              <Badge variant="destructive" className="bg-red-500">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
        {currentCompareAtPrice && (
          <p className="text-sm text-green-600">
            Таны хэмнэлт {formatPrice(currentCompareAtPrice - currentPrice)}
          </p>
        )}
      </div>

      {/* Options/Variants */}
      {product.options && product.options.length > 0 && (
        <div className="space-y-4">
          {product.options.map((option) => (
            <div key={option.name}>
              <label className="text-sm font-medium text-gray-700">
                {option.name}
              </label>
              <Select
                value={selectedOptions[option.name] || ''}
                onValueChange={(value) => handleOptionChange(option.name, value)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={`${option.name} сонгох`} />
                </SelectTrigger>
                <SelectContent>
                  {option.values.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Дууссан
          </Badge>
        ) : currentStock <= 10 ? (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Зөвхөн {currentStock} үлдсэн
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Check className="mr-1 h-3 w-3" />
            Нөөцөд байгаа
          </Badge>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Тоо ширхэг</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={quantity >= currentStock}
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            Сагсанд нэмэх
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={cn(
              'shrink-0',
              isInWishlist && 'border-red-500 text-red-500 hover:bg-red-50'
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="shrink-0"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <Button
          size="lg"
          className="w-full"
          variant="secondary"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
        >
          Одоо худалдаж авах
        </Button>
      </div>

      <Separator />

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Үнэгүй хүргэлт</p>
            <p className="text-xs text-gray-500">50,000₮-с дээш захиалгад</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Хялбар буцаалт</p>
            <p className="text-xs text-gray-500">30 хоногийн буцаалтын бодлого</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <Shield className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Аюулгүй төлбөр</p>
            <p className="text-xs text-gray-500">100% хамгаалалттай</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-900">Энэ бүтээгдэхүүний тухай</h3>
        <p className="mt-2 text-gray-600 whitespace-pre-line">{product.description}</p>
      </div>
    </div>
  )
}
