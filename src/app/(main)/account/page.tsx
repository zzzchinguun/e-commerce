'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MapPin, Heart, CreditCard, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@supabase/supabase-js'

const quickLinks = [
  {
    name: 'Your Orders',
    description: 'Track, return, or buy things again',
    href: '/account/orders',
    icon: Package,
  },
  {
    name: 'Your Addresses',
    description: 'Edit addresses for orders',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    name: 'Your Wishlist',
    description: 'View your saved items',
    href: '/wishlist',
    icon: Heart,
  },
  {
    name: 'Payment Methods',
    description: 'Manage payment methods',
    href: '/account/settings',
    icon: CreditCard,
  },
]

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-lg">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Button variant="outline" className="ml-auto" asChild>
            <Link href="/account/settings">Edit Profile</Link>
          </Button>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-4 rounded-lg border bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50"
          >
            <div className="rounded-lg bg-orange-100 p-3 text-orange-600 group-hover:bg-orange-200">
              <link.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{link.name}</h3>
              <p className="text-sm text-gray-500">{link.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
          </Link>
        ))}
      </div>

      {/* Recent Orders Preview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/account/orders"
            className="text-sm text-orange-600 hover:underline"
          >
            View all orders
          </Link>
        </div>
        <div className="mt-4 text-center py-8 text-gray-500">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">No orders yet</p>
          <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
