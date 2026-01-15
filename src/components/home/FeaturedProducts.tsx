'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'

// Placeholder products for now - will be replaced with real data from Supabase
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
]

interface FeaturedProductsProps {
  title: string
  viewAllHref?: string
  products?: typeof placeholderProducts
}

export function FeaturedProducts({
  title,
  viewAllHref = '/products',
  products = placeholderProducts,
}: FeaturedProductsProps) {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="ghost" asChild className="text-orange-600 hover:text-orange-700">
            <Link href={viewAllHref} className="flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
