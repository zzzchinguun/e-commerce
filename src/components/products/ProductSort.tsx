'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sortOptions = [
  { value: 'newest', label: 'Шинэ нэмэгдсэн' },
  { value: 'price_asc', label: 'Үнэ: Багаас их рүү' },
  { value: 'price_desc', label: 'Үнэ: Ихээс бага руу' },
  { value: 'rating', label: 'Үнэлгээгээр' },
  { value: 'popular', label: 'Эрэлттэй' },
]

export function ProductSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Эрэмбэлэх:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
