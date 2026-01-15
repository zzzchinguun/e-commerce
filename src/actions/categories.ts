'use server'

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  const categories = data as Category[] | null

  // Build hierarchical structure
  const parentCategories = categories?.filter((c) => !c.parent_id) || []
  const childCategories = categories?.filter((c) => c.parent_id) || []

  const hierarchicalCategories = parentCategories.map((parent) => ({
    ...parent,
    children: childCategories.filter((child) => child.parent_id === parent.id),
  }))

  return { categories: hierarchicalCategories, flatCategories: categories }
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return { error: error.message }
  }

  const category = data as Category

  // Get parent category if exists
  let parent = null
  if (category.parent_id) {
    const { data: parentData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', category.parent_id)
      .single()
    parent = parentData
  }

  // Get subcategories
  const { data: subcategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('parent_id', category.id)
    .eq('is_active', true)
    .order('sort_order')

  return {
    category: {
      ...category,
      parent,
      subcategories: subcategories || [],
    },
  }
}
