'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, Package, Heart, Settings, Store } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      logout()
      toast.success('Амжилттай гарлаа')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Гарахад алдаа гарлаа')
    }
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button
          variant="ghost"
          size="sm"
          className="flex h-auto w-[70px] cursor-pointer flex-col items-center gap-0.5 rounded-md px-3 py-2.5 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-800 hover:text-white"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">Нэвтрэх</span>
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex h-auto w-[70px] cursor-pointer flex-col items-center gap-0.5 rounded-md px-3 py-2.5 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-800 hover:text-white"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">Профайл</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user?.full_name || 'Хэрэглэгч'}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Миний бүртгэл
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            Захиалгууд
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            Хадгалсан
          </Link>
        </DropdownMenuItem>
        {user?.role === 'seller' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/seller" className="cursor-pointer">
                <Store className="mr-2 h-4 w-4" />
                Худалдагчийн самбар
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Админ самбар
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
