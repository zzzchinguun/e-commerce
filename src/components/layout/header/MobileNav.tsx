'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, User, Package, Heart, Settings, Store, LogOut, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '📱' },
  { name: 'Clothing', slug: 'clothing', icon: '👕' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽' },
  { name: 'Books', slug: 'books', icon: '📚' },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: '💄' },
  { name: 'Toys & Games', slug: 'toys-games', icon: '🎮' },
  { name: 'Automotive', slug: 'automotive', icon: '🚗' },
]

export function MobileNav() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore()

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      logout()
      closeMobileMenu()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  function handleLinkClick() {
    closeMobileMenu()
  }

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={closeMobileMenu}>
      <SheetContent side="left" className="w-80 p-0">
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Sign In</p>
                <p className="text-xs text-slate-300">Access your account</p>
              </div>
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Links */}
          <div className="p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Quick Links
            </h3>
            <div className="space-y-1">
              <Link
                href="/deals"
                onClick={handleLinkClick}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <span>Today&apos;s Deals</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/products?sort=newest"
                onClick={handleLinkClick}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <span>New Arrivals</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/products?sort=best_selling"
                onClick={handleLinkClick}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <span>Best Sellers</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Shop by Category
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  onClick={handleLinkClick}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  <span className="flex items-center gap-3">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <>
              <Separator />

              {/* Account Links */}
              <div className="p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  Your Account
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/account"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>

                  {user?.role === 'seller' && (
                    <Link
                      href="/seller"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                    >
                      <Store className="h-4 w-4" />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              </div>

              <Separator />

              {/* Sign Out */}
              <div className="p-4">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
