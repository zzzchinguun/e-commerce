import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Tag, Clock, Percent, Flame } from 'lucide-react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductSort } from '@/components/products/ProductSort'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: "Өнөөдрийн хямдрал - Хэмнээрэй",
  description: 'Шилдэг бүтээгдэхүүний гайхалтай хямдралуудыг олж мэдээрэй',
}

interface DealsPageProps {
  searchParams: Promise<{
    sort?: string
    page?: string
  }>
}

async function getDealsProducts(options?: {
  sort?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary
      )
    `, { count: 'exact' })
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .not('compare_at_price', 'is', null) // Only products with a sale price

  // Apply sorting
  switch (options?.sort) {
    case 'price_asc':
      query = query.order('base_price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('base_price', { ascending: false })
      break
    case 'discount':
      // Sort by discount percentage (highest first)
      query = query.order('compare_at_price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const limit = options?.limit || 24
  const offset = options?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data: products, count, error } = await query

  if (error) {
    return { products: [], count: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        storeName: product.seller_profiles.store_name,
      },
    }
  }) || []

  return { products: transformedProducts, count: count || 0 }
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const limit = 24
  const offset = (page - 1) * limit

  const { products, count } = await getDealsProducts({
    sort: params.sort,
    limit,
    offset,
  })

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Өнөөдрийн хямдрал</h1>
        </div>
        <p className="text-lg text-red-100">
          Шилдэг бүтээгдэхүүний гайхалтай хямдралууд. Хязгаарлагдмал хугацаатай санал!
        </p>
      </div>

      {/* Deal Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Tag className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-500">Идэвхтэй хямдрал</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Percent className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">50% хүртэл</p>
          <p className="text-sm text-gray-500">Хэмнэлт</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">24 цаг</p>
          <p className="text-sm text-gray-500">Өдөр бүр шинэчлэгдэнэ</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Flame className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Халуухан</p>
          <p className="text-sm text-gray-500">Хязгаарлагдмал нөөц</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{count}</span> хямдрал байна
        </p>
        <Suspense fallback={<Skeleton className="h-10 w-[180px]" />}>
          <ProductSort />
        </Suspense>
      </div>

      {/* Product Grid */}
      <Suspense fallback={<ProductGridSkeleton />}>
        {products.length > 0 ? (
          <ProductGrid products={products} columns={4} />
        ) : (
          <div className="rounded-lg border bg-gray-50 py-16 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Одоогоор хямдрал байхгүй байна</h2>
            <p className="mt-2 text-gray-500">
              Удахгүй шинэ хямдралууд нэмэгдэнэ
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
            >
              Бүх бүтээгдэхүүн үзэх
            </Link>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/deals?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              }).toString()}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Өмнөх
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Хуудас {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/deals?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              }).toString()}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Дараах
            </a>
          )}
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-12 rounded-xl bg-gray-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Хямдралыг бүү алдаарай</h2>
        <p className="mt-2 text-gray-400">
          Онцгой саналууд болон шуурхай хямдралын мэдээллийг авахын тулд бүртгүүлээрэй
        </p>
        <div className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            type="email"
            placeholder="Имэйл хаягаа оруулна уу"
            className="flex-1 rounded-lg px-4 py-2 text-gray-900"
          />
          <button className="rounded-lg bg-orange-500 px-6 py-2 font-semibold hover:bg-orange-600">
            Бүртгүүлэх
          </button>
        </div>
      </div>
    </div>
  )
}
