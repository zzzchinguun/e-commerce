'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

// ============================================
// TYPES
// ============================================

export type HeroBanner = Tables<'hero_banners'>

export type FeaturedCategory = Tables<'featured_categories'>

// ============================================
// HELPER
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

  return (data as { role: string } | null)?.role === 'admin'
}

// ============================================
// HERO BANNERS
// ============================================

export async function getHeroBanners(activeOnly = false) {
  const supabase = await createClient()

  let query = supabase
    .from('hero_banners')
    .select('*')
    .order('display_order', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    // Table might not exist yet, return empty array
    console.log('Hero banners table may not exist:', error.message)
    return { banners: [] }
  }

  return { banners: data as HeroBanner[] }
}

export async function createHeroBanner(banner: {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  bg_color: string
  image_url?: string
}) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Get max display order
  const { data: existing } = await supabase
    .from('hero_banners')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const existingData = existing as Array<{ display_order: number }> | null
  const displayOrder = existingData && existingData[0] ? existingData[0].display_order + 1 : 0

  const { data, error } = await (supabase as any)
    .from('hero_banners')
    .insert({
      ...banner,
      is_active: true,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { banner: data as HeroBanner }
}

export async function updateHeroBanner(
  id: string,
  updates: Partial<{
    title: string
    subtitle: string
    cta_text: string
    cta_link: string
    bg_color: string
    image_url: string
    is_active: boolean
    display_order: number
  }>
) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('hero_banners')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { banner: data as HeroBanner }
}

export async function deleteHeroBanner(id: string) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('hero_banners').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// ============================================
// FEATURED CATEGORIES
// ============================================

export async function getFeaturedCategories(activeOnly = false) {
  const supabase = await createClient()

  let query = supabase
    .from('featured_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    console.log('Featured categories error:', error.message)
    return { categories: [] }
  }

  return { categories: data }
}

export async function updateFeaturedCategory(
  id: string,
  updates: Partial<{
    name: string
    slug: string
    icon: string
    color: string
    bg_color: string
    is_active: boolean
    display_order: number
  }>
) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('featured_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { category: data }
}

export async function createFeaturedCategory(category: {
  name: string
  slug: string
  icon: string
  color: string
  bg_color: string
}) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Get max display order
  const { data: existing } = await supabase
    .from('featured_categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const displayOrder = existing && existing[0] ? existing[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from('featured_categories')
    .insert({
      ...category,
      is_active: true,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { category: data }
}

export async function deleteFeaturedCategory(id: string) {
  if (!(await isAdmin())) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('featured_categories').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
