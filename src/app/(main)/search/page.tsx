import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductSort } from '@/components/products/ProductSort'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ActiveFilters } from '@/components/products/ActiveFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicProducts } from '@/actions/products'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ''

  return {
    title: query ? `Search results for "${query}"` : 'Search Products',
    description: query
      ? `Find products matching "${query}"`
      : 'Search our wide selection of products',
  }
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

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const searchQuery = params.q || ''
  const page = parseInt(params.page || '1', 10)
  const limit = 24
  const offset = (page - 1) * limit

  // Fetch products from database
  const { products, count } = await getPublicProducts({
    search: searchQuery,
    category: params.category,
    sort: params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating' | undefined,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    rating: params.rating ? parseFloat(params.rating) : undefined,
    limit,
    offset,
  })

  // Transform for ProductGrid component
  const transformedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    seller: {
      storeName: p.seller.storeName,
    },
  }))

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        {searchQuery ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Search results for &quot;{searchQuery}&quot;
            </h1>
            <p className="mt-1 text-gray-500">
              {count} {count === 1 ? 'product' : 'products'} found
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Search Products</h1>
            <p className="mt-1 text-gray-500">
              Enter a search term to find products
            </p>
          </>
        )}
      </div>

      {/* Active Filters */}
      <Suspense fallback={null}>
        <div className="mb-4">
          <ActiveFilters />
        </div>
      </Suspense>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <Suspense fallback={<FiltersSkeleton />}>
              <ProductFilters />
            </Suspense>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Suspense fallback={null}>
              <ProductFilters className="lg:hidden" />
            </Suspense>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {count} {count === 1 ? 'product' : 'products'}
              </span>
              <Suspense fallback={<Skeleton className="h-10 w-[180px]" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            {transformedProducts.length > 0 ? (
              <ProductGrid products={transformedProducts} columns={4} />
            ) : (
              <div className="rounded-lg border bg-gray-50 py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                {searchQuery ? (
                  <>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                      No results found for &quot;{searchQuery}&quot;
                    </h2>
                    <p className="mt-2 text-gray-500">
                      Try adjusting your search or filters to find what you&apos;re looking for
                    </p>
                    <div className="mt-4 space-x-3">
                      <Link
                        href="/products"
                        className="inline-block rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                      >
                        Browse All Products
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                      Start your search
                    </h2>
                    <p className="mt-2 text-gray-500">
                      Use the search bar above to find products
                    </p>
                  </>
                )}
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/search?${new URLSearchParams({
                    ...params,
                    page: String(page - 1),
                  } as Record<string, string>).toString()}`}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/search?${new URLSearchParams({
                    ...params,
                    page: String(page + 1),
                  } as Record<string, string>).toString()}`}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
