'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingCart, User, Heart, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'
import { CategoryNav } from './CategoryNav'
import { MobileNav } from './MobileNav'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Header() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const openCart = useCartStore((state) => state.openCart)
  const { user, isAuthenticated } = useAuthStore()
  const { toggleMobileMenu } = useUIStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Top bar - Dark header like Amazon */}
        <div className="bg-slate-900 text-white">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-800 md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center">
              <span className="text-xl font-bold tracking-tight">MSTORE</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden flex-1 px-4 md:block lg:px-8">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* User Menu */}
              <UserMenu />

              {/* Wishlist - Hidden on mobile */}
              <Link href="/wishlist" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex h-auto w-[70px] cursor-pointer flex-col items-center gap-0.5 rounded-md px-3 py-2.5 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-800 hover:text-white"
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-[10px]">Хадгалсан</span>
                </Button>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative flex h-auto w-[70px] cursor-pointer flex-col items-center gap-0.5 rounded-md px-3 py-2.5 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-800 hover:text-white"
                onClick={openCart}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">Сагс</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <div className="hidden border-b bg-slate-800 md:block">
          <div className="container mx-auto px-4">
            <CategoryNav />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block border-b bg-slate-900 p-2 md:hidden">
          <SearchBar />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}
