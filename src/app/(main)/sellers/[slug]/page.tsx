import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Store,
  Star,
  Package,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSellerBySlug, getSellerProducts } from '@/actions/seller'
import { formatPrice } from '@/lib/utils'

interface SellerPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function SellerStorefrontPage({
  params,
  searchParams,
}: SellerPageProps) {
  const { slug } = await params
  const { page, sort } = await searchParams

  const { seller, error } = await getSellerBySlug(slug)

  if (error || !seller) {
    notFound()
  }

  const currentPage = page ? parseInt(page) : 1
  const sortOption = (sort as 'newest' | 'price-asc' | 'price-desc' | 'popular') || 'newest'

  const productsResult = await getSellerProducts(seller.id, {
    page: currentPage,
    limit: 12,
    sort: sortOption,
  })
  const products = productsResult.products
  const total = productsResult.total
  const totalPages = productsResult.totalPages || 1

  const joinedDate = new Date(seller.created_at).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Banner */}
      <div className="relative h-48 bg-gradient-to-r from-slate-800 to-slate-900 md:h-64">
        {seller.store_banner_url && (
          <Image
            src={seller.store_banner_url}
            alt={seller.store_name}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Store Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8 flex flex-col items-center gap-4 md:-mt-20 md:flex-row md:items-end md:gap-6">
          {/* Store Logo */}
          <div className="relative h-32 w-32 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg md:h-40 md:w-40">
            {seller.store_logo_url ? (
              <Image
                src={seller.store_logo_url}
                alt={seller.store_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                <Store className="h-16 w-16 text-white" />
              </div>
            )}
          </div>

          {/* Store Details */}
          <div className="flex-1 text-center md:pb-2 md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {seller.store_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600 md:justify-start">
              {seller.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{Number(seller.rating_average).toFixed(1)}</span>
                  <span className="text-gray-400">({seller.rating_count} үнэлгээ)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span>{seller.total_sales} борлуулалт</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{joinedDate}-с эхэлсэн</span>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          {seller.business_email && (
            <Button variant="outline" className="shrink-0" asChild>
              <a href={`mailto:${seller.business_email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Холбоо барих
              </a>
            </Button>
          )}
        </div>

        {/* Store Description */}
        {seller.store_description && (
          <Card className="mb-8">
            <CardContent className="py-4">
              <p className="text-gray-600">{seller.store_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        <div className="pb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Бүтээгдэхүүнүүд ({total})
            </h2>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Эрэмбэлэх:</span>
              <div className="flex gap-1">
                {[
                  { value: 'newest', label: 'Шинэ' },
                  { value: 'price-asc', label: 'Үнэ ↑' },
                  { value: 'price-desc', label: 'Үнэ ↓' },
                ].map((option) => (
                  <Link
                    key={option.value}
                    href={`/sellers/${slug}?sort=${option.value}`}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      sortOption === option.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">Бүтээгдэхүүн байхгүй</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <Badge className="absolute left-2 top-2 bg-red-500">
                            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-orange-600">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/sellers/${slug}?page=${currentPage - 1}&sort=${sortOption}`}
                    >
                      <Button variant="outline">Өмнөх</Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - currentPage) <= 1
                      )
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Link
                            href={`/sellers/${slug}?page=${p}&sort=${sortOption}`}
                          >
                            <Button
                              variant={currentPage === p ? 'default' : 'outline'}
                              size="sm"
                              className={currentPage === p ? 'bg-orange-500 hover:bg-orange-600' : ''}
                            >
                              {p}
                            </Button>
                          </Link>
                        </span>
                      ))}
                  </div>
                  {currentPage < totalPages && (
                    <Link
                      href={`/sellers/${slug}?page=${currentPage + 1}&sort=${sortOption}`}
                    >
                      <Button variant="outline">Дараах</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: SellerPageProps) {
  const { slug } = await params
  const { seller } = await getSellerBySlug(slug)

  if (!seller) {
    return { title: 'Дэлгүүр олдсонгүй' }
  }

  return {
    title: `${seller.store_name} | MSTORE`,
    description: seller.store_description || `${seller.store_name} дэлгүүрийн бүтээгдэхүүнүүд`,
  }
}
