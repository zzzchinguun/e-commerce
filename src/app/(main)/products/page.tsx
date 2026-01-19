import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductFilters, type CategoryFilter } from '@/components/products/ProductFilters'
import { ProductSort } from '@/components/products/ProductSort'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ActiveFilters } from '@/components/products/ActiveFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicProducts } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Бүтээгдэхүүн',
  description: 'Бүтээгдэхүүний өргөн сонголтоос хайх',
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

interface ProductsPageProps {
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const searchQuery = params.q
  const page = parseInt(params.page || '1', 10)
  const limit = 24
  const offset = (page - 1) * limit

  // Fetch categories for filters
  const { categories: hierarchicalCategories } = await getCategories()

  // Transform categories for filter component
  const filterCategories: CategoryFilter[] = (hierarchicalCategories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    children: cat.children?.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
    })),
  }))

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
    category: p.category,
  }))

  const totalPages = Math.ceil(count / limit)

  return (
    <Container className="py-8">
      {/* Page Header */}
      <div className="mb-6">
        {searchQuery ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Хайлтын үр дүн: &quot;{searchQuery}&quot;
            </h1>
            <p className="mt-1 text-gray-500">
              {count} бүтээгдэхүүн олдлоо
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Бүх бүтээгдэхүүн</h1>
            <p className="mt-1 text-gray-500">
              Бүтээгдэхүүний өргөн сонголтоос хайх
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
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-32">
            <Suspense fallback={<FiltersSkeleton />}>
              <ProductFilters categories={filterCategories} />
            </Suspense>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Suspense fallback={null}>
              <ProductFilters className="lg:hidden" categories={filterCategories} />
            </Suspense>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {count} бүтээгдэхүүн
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
              <div className="py-12 text-center">
                <p className="text-gray-500">Бүтээгдэхүүн олдсонгүй</p>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-400">
                    Хайлт эсвэл шүүлтүүрээ өөрчилж үзнэ үү
                  </p>
                )}
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/products?${new URLSearchParams({
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
                  href={`/products?${new URLSearchParams({
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
        </div>
      </div>
    </Container>
  )
}
