'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Package, Store, ShoppingCart, Megaphone, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type NotificationType,
} from '@/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { mn } from 'date-fns/locale'

const notificationIcons: Record<NotificationType, React.ElementType> = {
  order_placed: ShoppingCart,
  order_shipped: Package,
  order_delivered: Package,
  seller_approved: Store,
  seller_rejected: Store,
  product_approved: Package,
  product_rejected: Package,
  system: Info,
  promotion: Megaphone,
  announcement: Megaphone,
}

const notificationColors: Record<NotificationType, string> = {
  order_placed: 'bg-blue-100 text-blue-600',
  order_shipped: 'bg-yellow-100 text-yellow-600',
  order_delivered: 'bg-green-100 text-green-600',
  seller_approved: 'bg-green-100 text-green-600',
  seller_rejected: 'bg-red-100 text-red-600',
  product_approved: 'bg-green-100 text-green-600',
  product_rejected: 'bg-red-100 text-red-600',
  system: 'bg-gray-100 text-gray-600',
  promotion: 'bg-orange-100 text-orange-600',
  announcement: 'bg-purple-100 text-purple-600',
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  async function fetchUnreadCount() {
    const result = await getUnreadNotificationCount()
    setUnreadCount(result.count)
  }

  async function fetchNotifications() {
    setLoading(true)
    const result = await getMyNotifications(10)
    if (result.notifications) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }

  async function handleMarkAsRead(notificationId: string) {
    await markNotificationAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Мэдэгдлүүд</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-orange-600 hover:text-orange-700"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Бүгдийг уншсан
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Мэдэгдэл байхгүй</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => {
                const notificationType = notification.type as NotificationType
                const Icon = notificationIcons[notificationType] || Info
                const colorClass = notificationColors[notificationType] || 'bg-gray-100 text-gray-600'

                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 rounded-lg p-3 transition-colors ${
                      notification.is_read
                        ? 'bg-white'
                        : 'bg-orange-50 hover:bg-orange-100'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm leading-tight ${!notification.is_read ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: mn,
                          })}
                        </p>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
