'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'

const categoryNames: Record<string, string> = {
  'electronics': 'Electronics',
  'fashion': 'Fashion',
  'home-garden': 'Home & Garden',
  'health-beauty': 'Health & Beauty',
  'sports-outdoors': 'Sports & Outdoors',
  'automotive': 'Automotive',
  'books-media': 'Books & Media',
  'toys-games': 'Toys & Games',
}

export function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = searchParams.get('category')?.split(',').filter(Boolean) || []
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const rating = searchParams.get('rating')
  const search = searchParams.get('q')

  const hasFilters = categories.length > 0 || minPrice || maxPrice || rating || search

  if (!hasFilters) return null

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (key === 'category' && value) {
      const newCategories = categories.filter((c) => c !== value)
      if (newCategories.length > 0) {
        params.set('category', newCategories.join(','))
      } else {
        params.delete('category')
      }
    } else {
      params.delete(key)
    }

    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/products')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Active filters:</span>

      {search && (
        <FilterTag onRemove={() => removeFilter('q')}>
          Search: &quot;{search}&quot;
        </FilterTag>
      )}

      {categories.map((category) => (
        <FilterTag key={category} onRemove={() => removeFilter('category', category)}>
          {categoryNames[category] || category}
        </FilterTag>
      ))}

      {(minPrice || maxPrice) && (
        <FilterTag
          onRemove={() => {
            removeFilter('minPrice')
            removeFilter('maxPrice')
          }}
        >
          Price: {minPrice ? formatPrice(parseInt(minPrice)) : '$0'} -{' '}
          {maxPrice ? formatPrice(parseInt(maxPrice)) : '$1000+'}
        </FilterTag>
      )}

      {rating && (
        <FilterTag onRemove={() => removeFilter('rating')}>
          {rating}+ Stars
        </FilterTag>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="text-orange-600 hover:text-orange-700"
        onClick={clearAllFilters}
      >
        Clear all
      </Button>
    </div>
  )
}

function FilterTag({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
      {children}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
