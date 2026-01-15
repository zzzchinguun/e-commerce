'use client'

import Link from 'next/link'
import { Menu, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Main categories - these would typically come from the database
const mainCategories = [
  { name: 'Электроник', slug: 'electronics' },
  { name: 'Хувцас', slug: 'clothing' },
  { name: 'Гэр & Цэцэрлэг', slug: 'home-garden' },
  { name: 'Спорт', slug: 'sports-outdoors' },
  { name: 'Ном', slug: 'books' },
  { name: 'Гоо сайхан', slug: 'beauty-health' },
  { name: 'Тоглоом', slug: 'toys-games' },
]

const quickLinks = [
  { name: 'Өнөөдрийн хямдрал', href: '/deals' },
  { name: 'Шинэ бүтээгдэхүүн', href: '/products?sort=newest' },
  { name: 'Хамгийн их зарагдсан', href: '/products?sort=best_selling' },
]

export function CategoryNav() {
  return (
    <nav className="flex items-center gap-1 py-2 text-sm text-white">
      {/* All Categories Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-white hover:bg-slate-700"
          >
            <Menu className="h-4 w-4" />
            Бүх ангилал
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {mainCategories.map((category) => (
            <DropdownMenuItem key={category.slug} asChild>
              <Link
                href={`/categories/${category.slug}`}
                className="cursor-pointer"
              >
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Links */}
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded px-3 py-1.5 hover:bg-slate-700"
        >
          {link.name}
        </Link>
      ))}

      {/* Main Categories - visible on larger screens */}
      <div className="ml-2 hidden items-center gap-1 lg:flex">
        <span className="mx-2 h-4 w-px bg-slate-600" />
        {mainCategories.slice(0, 5).map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="rounded px-3 py-1.5 hover:bg-slate-700"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
