'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  DollarSign,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/admin/NotificationBell'
import { getSellerPendingOrderCount, getSellerProfile } from '@/actions/seller'

type SellerProfile = {
  id: string
  store_name: string
  store_slug: string
  store_logo_url: string | null
  status: string
}

const sidebarLinks = [
  {
    name: 'Хянах самбар',
    href: '/seller',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Бүтээгдэхүүн',
    href: '/seller/products',
    icon: Package,
  },
  {
    name: 'Захиалгууд',
    href: '/seller/orders',
    icon: ShoppingCart,
    badgeKey: 'pendingOrders',
  },
  {
    name: 'Статистик',
    href: '/seller/analytics',
    icon: BarChart3,
  },
  {
    name: 'Орлого',
    href: '/seller/earnings',
    icon: DollarSign,
  },
  {
    name: 'Тохиргоо',
    href: '/seller/settings',
    icon: Settings,
  },
]

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    // Load seller profile
    getSellerProfile().then((result) => {
      if (result.profile) {
        setSellerProfile(result.profile as SellerProfile)
      }
      setIsLoadingProfile(false)
    })
  }, [])

  useEffect(() => {
    getSellerPendingOrderCount().then((result) => {
      setPendingOrders(result.count)
    })
  }, [pathname])

  const getBadge = (badgeKey?: string) => {
    if (badgeKey === 'pendingOrders' && pendingOrders > 0) {
      return pendingOrders.toString()
    }
    return null
  }

  // Get initials from store name
  const getStoreInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform bg-white shadow-lg transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link href="/seller" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-gray-900">Худалдагчийн төв</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)
            const badge = getBadge(link.badgeKey)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span className="flex-1">{link.name}</span>
                {badge && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Store Link */}
        <div className="shrink-0 border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <Store className="h-4 w-4" />
            Дэлгүүр рүү буцах
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title - Desktop */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {sidebarLinks.find(
                (link) =>
                  link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href)
              )?.name || 'Худалдагчийн хянах самбар'}
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  {isLoadingProfile ? (
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                  ) : sellerProfile ? (
                    <Avatar className="h-8 w-8">
                      {sellerProfile.store_logo_url ? (
                        <AvatarImage
                          src={sellerProfile.store_logo_url}
                          alt={sellerProfile.store_name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                        {getStoreInitials(sellerProfile.store_name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-400">
                        <Store className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="hidden text-sm font-medium lg:block">
                    {isLoadingProfile
                      ? '...'
                      : sellerProfile
                        ? sellerProfile.store_name
                        : 'Дэлгүүргүй'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {sellerProfile ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {sellerProfile.store_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          /{sellerProfile.store_slug}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/seller/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Дэлгүүрийн тохиргоо
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <User className="mr-2 h-4 w-4" />
                        Бүртгэлийн тохиргоо
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Гарах
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-3 text-center">
                      <Store className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        Танд дэлгүүр байхгүй байна
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/seller/register"
                        className="flex items-center justify-center text-orange-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Дэлгүүр үүсгэх
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <User className="mr-2 h-4 w-4" />
                        Бүртгэлийн тохиргоо
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Гарах
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
