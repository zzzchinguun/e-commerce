'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'seller_approved'
  | 'seller_rejected'
  | 'product_approved'
  | 'product_rejected'
  | 'system'
  | 'promotion'
  | 'announcement'

// Use database type for Notification
export type Notification = Tables<'notifications'>

// ============================================
// USER NOTIFICATION ACTIONS
// ============================================

export async function getMyNotifications(limit = 20) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { notifications }
}

export async function getUnreadNotificationCount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { count: 0 }
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { count: 0 }
  }

  return { count: count || 0 }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ============================================
// ADMIN NOTIFICATION ACTIONS
// ============================================

async function isAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return data?.role === 'admin'
}

export async function sendNotificationToUser(
  userId: string,
  notification: {
    type: NotificationType
    title: string
    message: string
    data?: Record<string, any>
  }
) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { notification: data }
}

export async function sendNotificationToAllUsers(notification: {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')

  if (usersError) {
    return { error: usersError.message }
  }

  if (!users || users.length === 0) {
    return { error: 'No users found' }
  }

  // Create notifications for all users
  const notifications = users.map((user: { id: string }) => ({
    user_id: user.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    return { error: error.message }
  }

  return { success: true, count: users.length }
}

export async function sendNotificationToRole(
  role: 'customer' | 'seller' | 'admin',
  notification: {
    type: NotificationType
    title: string
    message: string
    data?: Record<string, any>
  }
) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  // Get users with specified role
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .eq('role', role)

  if (usersError) {
    return { error: usersError.message }
  }

  if (!users || users.length === 0) {
    return { error: 'No users found with this role' }
  }

  // Create notifications for all users with this role
  const notifications = users.map((user: { id: string }) => ({
    user_id: user.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    return { error: error.message }
  }

  return { success: true, count: users.length }
}

// Helper function to create system notifications (used internally)
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'system',
  data?: Record<string, any>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data: data || {},
    })

  if (error) {
    console.error('Failed to create notification:', error)
    return { error: error.message }
  }

  return { success: true }
}
