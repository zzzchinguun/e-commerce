'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  User,
  Shield,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'
import { getImpersonationStatus, getPendingSellerCount } from '@/actions/admin'

const sidebarLinks = [
  {
    name: 'Хянах самбар',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Хэрэглэгчид',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Худалдагчид',
    href: '/admin/sellers',
    icon: Store,
    badgeKey: 'pendingSellers',
  },
  {
    name: 'Бүтээгдэхүүн',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Захиалгууд',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Статистик',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Тохиргоо',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingSellers, setPendingSellers] = useState(0)
  const [impersonation, setImpersonation] = useState<{
    isImpersonating: boolean
    impersonatedUser?: { id: string; email: string; name: string }
  }>({ isImpersonating: false })

  useEffect(() => {
    // Fetch pending seller count
    getPendingSellerCount().then((result) => {
      if (result.count) {
        setPendingSellers(result.count)
      }
    })

    // Check impersonation status
    getImpersonationStatus().then((result) => {
      setImpersonation(result as any)
    })
  }, [pathname])

  const getBadge = (badgeKey?: string) => {
    if (badgeKey === 'pendingSellers' && pendingSellers > 0) {
      return pendingSellers.toString()
    }
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Impersonation Banner */}
      {impersonation.isImpersonating && impersonation.impersonatedUser && (
        <ImpersonationBanner impersonatedUser={impersonation.impersonatedUser} />
      )}

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
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 shadow-lg transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          impersonation.isImpersonating && 'top-10'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-white">Админ төв</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
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
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span className="flex-1">{link.name}</span>
                {badge && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Store Link */}
        <div className="border-t border-slate-700 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'flex flex-1 flex-col',
        impersonation.isImpersonating && 'pt-10'
      )}>
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
              )?.name || 'Админ хянах самбар'}
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingSellers > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-100 text-orange-600">A</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:block">
                    Админ
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Платформ тохиргоо
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    Миний бүртгэл
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Гарах
                </DropdownMenuItem>
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
