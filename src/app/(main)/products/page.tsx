import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductSort } from '@/components/products/ProductSort'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ActiveFilters } from '@/components/products/ActiveFilters'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our wide selection of products',
}

// Placeholder products - will be replaced with real data from Supabase
const placeholderProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones with Noise Cancellation',
    slug: 'wireless-bluetooth-headphones',
    price: 79.99,
    compareAtPrice: 129.99,
    image: null,
    rating: 4.5,
    reviewCount: 1234,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '2',
    name: 'Premium Cotton T-Shirt - Multiple Colors Available',
    slug: 'premium-cotton-tshirt',
    price: 24.99,
    compareAtPrice: null,
    image: null,
    rating: 4.2,
    reviewCount: 856,
    seller: { storeName: 'FashionHub' },
  },
  {
    id: '3',
    name: 'Smart Home LED Light Bulbs - 4 Pack',
    slug: 'smart-home-led-bulbs',
    price: 34.99,
    compareAtPrice: 49.99,
    image: null,
    rating: 4.7,
    reviewCount: 2103,
    seller: { storeName: 'HomeEssentials' },
  },
  {
    id: '4',
    name: 'Organic Face Moisturizer with SPF 30',
    slug: 'organic-face-moisturizer',
    price: 28.99,
    compareAtPrice: null,
    image: null,
    rating: 4.4,
    reviewCount: 567,
    seller: { storeName: 'BeautyNaturals' },
  },
  {
    id: '5',
    name: 'Portable Bluetooth Speaker - Waterproof',
    slug: 'portable-bluetooth-speaker',
    price: 45.99,
    compareAtPrice: 69.99,
    image: null,
    rating: 4.6,
    reviewCount: 1892,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '6',
    name: 'Yoga Mat with Carrying Strap - Extra Thick',
    slug: 'yoga-mat-extra-thick',
    price: 32.99,
    compareAtPrice: null,
    image: null,
    rating: 4.3,
    reviewCount: 723,
    seller: { storeName: 'FitLife' },
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle - Vacuum Insulated',
    slug: 'stainless-steel-water-bottle',
    price: 24.99,
    compareAtPrice: 34.99,
    image: null,
    rating: 4.8,
    reviewCount: 3421,
    seller: { storeName: 'EcoLife' },
  },
  {
    id: '8',
    name: 'Wireless Gaming Mouse - RGB Backlit',
    slug: 'wireless-gaming-mouse',
    price: 59.99,
    compareAtPrice: 79.99,
    image: null,
    rating: 4.6,
    reviewCount: 1567,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '9',
    name: 'Men\'s Running Shoes - Lightweight Mesh',
    slug: 'mens-running-shoes',
    price: 89.99,
    compareAtPrice: 119.99,
    image: null,
    rating: 4.4,
    reviewCount: 892,
    seller: { storeName: 'SportZone' },
  },
  {
    id: '10',
    name: 'Essential Oil Diffuser - 300ml Capacity',
    slug: 'essential-oil-diffuser',
    price: 29.99,
    compareAtPrice: null,
    image: null,
    rating: 4.5,
    reviewCount: 1245,
    seller: { storeName: 'HomeEssentials' },
  },
  {
    id: '11',
    name: 'Laptop Stand - Adjustable Aluminum',
    slug: 'laptop-stand-adjustable',
    price: 39.99,
    compareAtPrice: 54.99,
    image: null,
    rating: 4.7,
    reviewCount: 2341,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '12',
    name: 'Women\'s Casual Sneakers - Memory Foam',
    slug: 'womens-casual-sneakers',
    price: 54.99,
    compareAtPrice: null,
    image: null,
    rating: 4.3,
    reviewCount: 678,
    seller: { storeName: 'FashionHub' },
  },
]

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

  // In a real app, fetch products based on searchParams
  // For now, use placeholder data
  const products = placeholderProducts

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
              {products.length} products found
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <p className="mt-1 text-gray-500">
              Browse our wide selection of products
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
                {products.length} products
              </span>
              <Suspense fallback={<Skeleton className="h-10 w-[180px]" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} columns={4} />
          </Suspense>

          {/* Pagination Placeholder */}
          <div className="mt-8 flex justify-center">
            <div className="text-sm text-gray-500">
              Showing 1-{products.length} of {products.length} products
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
