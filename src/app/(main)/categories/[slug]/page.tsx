import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductSort } from '@/components/products/ProductSort'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ActiveFilters } from '@/components/products/ActiveFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicProducts } from '@/actions/products'
import { createClient } from '@/lib/supabase/server'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sort?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
    page?: string
  }>
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

// Get category info
async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Category | null
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.name} - Shop Now`,
    description: category.description || `Browse our ${category.name} collection`,
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
    </div>
  )
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const searchParamsResolved = await searchParams

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const page = parseInt(searchParamsResolved.page || '1', 10)
  const limit = 24
  const offset = (page - 1) * limit

  const { products, count } = await getPublicProducts({
    category: slug,
    sort: searchParamsResolved.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating' | undefined,
    minPrice: searchParamsResolved.minPrice ? parseFloat(searchParamsResolved.minPrice) : undefined,
    maxPrice: searchParamsResolved.maxPrice ? parseFloat(searchParamsResolved.maxPrice) : undefined,
    rating: searchParamsResolved.rating ? parseFloat(searchParamsResolved.rating) : undefined,
    limit,
    offset,
  })

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
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-orange-600">Home</Link>
          </li>
          <li><ChevronRight className="h-4 w-4" /></li>
          <li>
            <Link href="/categories" className="hover:text-orange-600">Categories</Link>
          </li>
          <li><ChevronRight className="h-4 w-4" /></li>
          <li className="text-gray-900">{category.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{count} products</p>
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
              <span className="text-sm text-gray-500">{count} products</span>
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
                <p className="text-gray-500">No products found in this category</p>
                <p className="mt-2 text-sm text-gray-400">
                  Check back soon for new arrivals
                </p>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/categories/${slug}?${new URLSearchParams({
                    ...searchParamsResolved,
                    page: String(page - 1),
                  }).toString()}`}
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
                  href={`/categories/${slug}?${new URLSearchParams({
                    ...searchParamsResolved,
                    page: String(page + 1),
                  }).toString()}`}
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
