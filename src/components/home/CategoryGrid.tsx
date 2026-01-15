'use client'

import Link from 'next/link'
import {
  Laptop,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  Car,
  BookOpen,
  Gamepad2,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  slug: string
  icon: LucideIcon
  color: string
  bgColor: string
}

const categories: Category[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: Laptop,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: Shirt,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
  },
  {
    name: 'Sports',
    slug: 'sports-outdoors',
    icon: Dumbbell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    icon: Car,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 hover:bg-slate-100',
  },
  {
    name: 'Books',
    slug: 'books-media',
    icon: BookOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    name: 'Gaming',
    slug: 'toys-games',
    icon: Gamepad2,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
]

export function CategoryGrid() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className={cn(
                'flex flex-col items-center gap-3 rounded-lg p-4 transition-colors',
                category.bgColor
              )}
            >
              <div className={cn('rounded-full bg-white p-3 shadow-sm', category.color)}>
                <category.icon className="h-6 w-6" />
              </div>
              <span className="text-center text-sm font-medium text-gray-900">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
