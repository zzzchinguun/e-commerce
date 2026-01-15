'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  function handleClear() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Бүтээгдэхүүн, брэнд хайх..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="h-10 rounded-r-none border-0 bg-white pr-8 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-10 rounded-l-none bg-orange-500 px-4 hover:bg-orange-600"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search suggestions would go here */}
      {isFocused && query.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-white shadow-lg">
          <div className="p-3 text-sm text-gray-500">
            &quot;{query}&quot; хайхын тулд Enter дарна уу
          </div>
        </div>
      )}
    </form>
  )
}
