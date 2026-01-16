'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>
type Product = Tables<'products'>

// ============================================
// PUBLIC PRODUCT ACTIONS (No auth required)
// ============================================

export type PublicProduct = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  image: string | null
  rating: number
  reviewCount: number
  seller: {
    id: string
    storeName: string
    storeSlug: string
  }
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

export type ProductDetail = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  rating: number
  reviewCount: number
  stock: number
  images: string[]
  seller: {
    id: string
    storeName: string
    storeSlug: string
    rating: number
  }
  variants: {
    id: string
    name: string
    price: number
    compareAtPrice: number | null
    stock: number
    options: Record<string, string>
  }[]
  options: {
    name: string
    values: string[]
  }[]
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export async function getPublicProducts(options?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'
  limit?: number
  offset?: number
}): Promise<{ products: PublicProduct[]; count: number; error?: string }> {
  const supabase = await createClient()

  // If filtering by category slug, first get the category ID(s)
  let categoryIds: string[] = []
  if (options?.category) {
    // Support multiple categories (comma-separated)
    const categorySlugs = options.category.split(',').filter(Boolean)

    // Get category IDs for the given slugs (including subcategories)
    const { data: categories } = await supabase
      .from('categories')
      .select('id, parent_id')
      .in('slug', categorySlugs)

    const categoriesArr = categories as { id: string; parent_id: string | null }[] | null
    if (categoriesArr && categoriesArr.length > 0) {
      const parentIds = categoriesArr.map(c => c.id)

      // Also get subcategories if a parent category is selected
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .in('parent_id', parentIds)

      const subcategoriesArr = subcategories as { id: string }[] | null
      categoryIds = [
        ...parentIds,
        ...(subcategoriesArr?.map(c => c.id) || [])
      ]
    }
  }

  // Build query for active products only
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      sales_count,
      created_at,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary,
        position
      ),
      categories (
        id,
        name,
        slug
      )
    `, { count: 'exact' })
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')

  // Apply category filter using category_id
  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds)
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.minPrice) {
    query = query.gte('base_price', options.minPrice)
  }

  if (options?.maxPrice) {
    query = query.lte('base_price', options.maxPrice)
  }

  if (options?.rating) {
    query = query.gte('rating_average', options.rating)
  }

  // Apply sorting
  switch (options?.sort) {
    case 'price_asc':
      query = query.order('base_price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('base_price', { ascending: false })
      break
    case 'popular':
      query = query.order('sales_count', { ascending: false, nullsFirst: false })
      break
    case 'rating':
      query = query.order('rating_average', { ascending: false, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Apply pagination
  const limit = options?.limit || 24
  const offset = options?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data: products, error, count } = await query

  if (error) {
    return { products: [], count: 0, error: error.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts: PublicProduct[] = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        id: product.seller_profiles.id,
        storeName: product.seller_profiles.store_name,
        storeSlug: product.seller_profiles.store_slug,
      },
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug,
      } : null,
    }
  }) || []

  return { products: transformedProducts, count: count || 0 }
}

export async function getPublicProductBySlug(slug: string): Promise<{ product: ProductDetail | null; error?: string }> {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        rating_average,
        status
      ),
      product_images (
        url,
        position
      ),
      product_variants (
        id,
        sku,
        price,
        compare_at_price,
        option_values,
        is_default
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { product: null }
    }
    return { product: null, error: error.message }
  }

  if (!product) {
    return { product: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any

  // Fetch inventory for all variants separately
  const variantIds = p.product_variants?.map((v: { id: string }) => v.id) || []
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select('variant_id, quantity')
    .in('variant_id', variantIds)

  // Create a map of variant_id to quantity
  const inventoryMap = new Map<string, number>()
  if (inventoryData) {
    inventoryData.forEach((inv: { variant_id: string; quantity: number }) => {
      inventoryMap.set(inv.variant_id, inv.quantity)
    })
  }

  // Get total stock from all variants
  let totalStock = 0
  p.product_variants?.forEach((v: { id: string }) => {
    totalStock += inventoryMap.get(v.id) || 0
  })

  // Sort images by position
  const sortedImages = [...(p.product_images || [])].sort((a: { position: number }, b: { position: number }) => a.position - b.position)

  // Transform variants with inventory from map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = p.product_variants?.map((v: any) => ({
    id: v.id,
    name: v.sku || 'Default',
    price: v.price,
    compareAtPrice: v.compare_at_price,
    stock: inventoryMap.get(v.id) || 0,
    options: v.option_values || {},
  })) || []

  // Extract unique option names and values from variants
  const optionsMap = new Map<string, Set<string>>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants.forEach((v: any) => {
    Object.entries(v.options).forEach(([key, value]) => {
      if (!optionsMap.has(key)) {
        optionsMap.set(key, new Set())
      }
      optionsMap.get(key)?.add(value as string)
    })
  })

  const options = Array.from(optionsMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }))

  const transformedProduct: ProductDetail = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    rating: p.rating_average || 0,
    reviewCount: p.rating_count || 0,
    stock: totalStock,
    images: sortedImages.map((img: { url: string }) => img.url),
    seller: {
      id: p.seller_profiles.id,
      storeName: p.seller_profiles.store_name,
      storeSlug: p.seller_profiles.store_slug,
      rating: p.seller_profiles.rating_average || 0,
    },
    variants,
    options,
    category: p.categories ? {
      id: p.categories.id,
      name: p.categories.name,
      slug: p.categories.slug,
    } : null,
  }

  return { product: transformedProduct }
}

export async function getFeaturedProducts(limit = 6): Promise<{ products: PublicProduct[] }> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts: PublicProduct[] = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        id: product.seller_profiles.id,
        storeName: product.seller_profiles.store_name,
        storeSlug: product.seller_profiles.store_slug,
      },
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug,
      } : null,
    }
  }) || []

  return { products: transformedProducts }
}

export async function getBestSellers(limit = 6): Promise<{ products: PublicProduct[] }> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      sales_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .order('sales_count', { ascending: false, nullsFirst: false })
    .limit(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts: PublicProduct[] = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        id: product.seller_profiles.id,
        storeName: product.seller_profiles.store_name,
        storeSlug: product.seller_profiles.store_slug,
      },
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug,
      } : null,
    }
  }) || []

  return { products: transformedProducts }
}

export async function getNewArrivals(limit = 6): Promise<{ products: PublicProduct[] }> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts: PublicProduct[] = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        id: product.seller_profiles.id,
        storeName: product.seller_profiles.store_name,
        storeSlug: product.seller_profiles.store_slug,
      },
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug,
      } : null,
    }
  }) || []

  return { products: transformedProducts }
}

export async function getRelatedProducts(productId: string, categoryId?: string, limit = 6): Promise<{ products: PublicProduct[] }> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      base_price,
      compare_at_price,
      rating_average,
      rating_count,
      seller_profiles!inner (
        id,
        store_name,
        store_slug,
        status
      ),
      product_images (
        url,
        is_primary
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .eq('seller_profiles.status', 'approved')
    .neq('id', productId)
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  query = query.order('rating_average', { ascending: false, nullsFirst: false })

  const { data: products } = await query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts: PublicProduct[] = (products as any[])?.map((product) => {
    const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url
    const firstImage = product.product_images?.[0]?.url

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      compareAtPrice: product.compare_at_price,
      image: primaryImage || firstImage || null,
      rating: product.rating_average || 0,
      reviewCount: product.rating_count || 0,
      seller: {
        id: product.seller_profiles.id,
        storeName: product.seller_profiles.store_name,
        storeSlug: product.seller_profiles.store_slug,
      },
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug,
      } : null,
    }
  }) || []

  return { products: transformedProducts }
}

// ============================================
// PRODUCT CRUD ACTIONS
// ============================================

export type ProductInput = {
  name: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  categoryId?: string
  status?: 'draft' | 'active' | 'inactive'
  isFeatured?: boolean
  isDigital?: boolean
  requiresShipping?: boolean
  brand?: string
  tags?: string[]
  weight?: number
  stock?: number
  trackInventory?: boolean
}

export async function getSellerProducts(options?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Build query - fetch products with variants
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        id,
        url,
        is_primary,
        position
      ),
      product_variants!inner (
        id,
        sku,
        price
      )
    `)
    .eq('seller_id', profile.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  // Apply filters
  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: products, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = products as any[] | null

  // Transform data to include stock info - fetch inventory for each product
  const transformedProducts = await Promise.all(
    (items || []).map(async (product: any) => {
      const defaultVariant = product.product_variants?.[0]
      let stock = 0
      let reservedStock = 0

      if (defaultVariant?.id) {
        // Fetch inventory separately
        const { data: inventoryData } = await supabase
          .from('inventory')
          .select('quantity, reserved_quantity')
          .eq('variant_id', defaultVariant.id)
          .single()

        if (inventoryData) {
          stock = (inventoryData as any).quantity ?? 0
          reservedStock = (inventoryData as any).reserved_quantity ?? 0
        }
      }

      return {
        ...product,
        stock,
        reservedStock,
        mainImage: product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url ||
          product.product_images?.[0]?.url || null,
      }
    })
  )

  return { products: transformedProducts, count }
}

export async function getProduct(productId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        id,
        url,
        alt_text,
        is_primary,
        position
      ),
      product_variants (
        id,
        sku,
        barcode,
        price,
        compare_at_price,
        option_values
      )
    `)
    .eq('id', productId)
    .eq('seller_id', profile.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Fetch inventory separately for each variant (nested query doesn't work)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any
  const variantIds = p.product_variants?.map((v: { id: string }) => v.id) || []

  if (variantIds.length > 0) {
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('variant_id, quantity, reserved_quantity, low_stock_threshold, track_inventory')
      .in('variant_id', variantIds)

    // Attach inventory to each variant
    if (inventoryData) {
      const inventoryMap = new Map(
        inventoryData.map((inv: { variant_id: string; quantity: number; reserved_quantity: number; low_stock_threshold: number; track_inventory: boolean }) => [inv.variant_id, inv])
      )

      p.product_variants = p.product_variants.map((v: { id: string }) => ({
        ...v,
        inventory: inventoryMap.has(v.id) ? [inventoryMap.get(v.id)] : []
      }))
    }
  }

  return { product: p }
}

export async function createProduct(input: ProductInput, images?: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id' | 'status'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  if (profile.status !== 'approved') {
    return { error: 'Your seller account is not approved yet' }
  }

  // Generate slug
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)

  // Create product - cast to any to bypass TypeScript inference issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: productData, error: productError } = await (supabase as any)
    .from('products')
    .insert({
      seller_id: profile.id,
      name: input.name,
      slug,
      description: input.description,
      short_description: input.shortDescription,
      base_price: input.price,
      compare_at_price: input.compareAtPrice,
      cost_price: input.costPrice,
      sku: input.sku,
      barcode: input.barcode,
      category_id: input.categoryId || null,
      status: input.status || 'draft',
      is_featured: input.isFeatured || false,
      is_digital: input.isDigital || false,
      requires_shipping: input.requiresShipping ?? true,
      brand: input.brand,
      tags: input.tags,
      weight: input.weight,
    })
    .select()
    .single()

  if (productError) {
    return { error: productError.message }
  }

  const product = productData as Product

  // Create default variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: variantData, error: variantError } = await (supabase as any)
    .from('product_variants')
    .insert({
      product_id: product.id,
      sku: input.sku,
      barcode: input.barcode,
      price: input.price,
      compare_at_price: input.compareAtPrice,
      cost_price: input.costPrice,
      weight: input.weight,
      is_default: true,
    })
    .select()
    .single()

  if (variantError) {
    // Rollback product creation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('products').delete().eq('id', product.id)
    return { error: variantError.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variant = variantData as any

  // Create inventory for variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inventoryData, error: inventoryError } = await (supabase as any)
    .from('inventory')
    .insert({
      variant_id: variant.id,
      quantity: input.stock ?? 0,
      track_inventory: input.trackInventory ?? true,
      low_stock_threshold: 5,
    })
    .select()
    .single()

  if (inventoryError) {
    console.error('Failed to create inventory:', inventoryError)
    console.error('Variant ID:', variant.id, 'Stock:', input.stock)
    // Don't fail the whole product creation, but log the error
  } else {
    console.log('Inventory created successfully:', inventoryData)
  }

  // Add product images
  if (images && images.length > 0) {
    const imageInserts = images.map((url, index) => ({
      product_id: product.id,
      url,
      position: index,
      is_primary: index === 0,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('product_images').insert(imageInserts)
  }

  revalidatePath('/seller/products')
  return { product }
}

export async function updateProduct(productId: string, input: Partial<ProductInput>, images?: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Verify product belongs to seller
  const { data: existingProductData } = await supabase
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .single()

  const existingProduct = existingProductData as Pick<Product, 'id' | 'seller_id'> | null

  if (!existingProduct || existingProduct.seller_id !== profile.id) {
    return { error: 'Product not found' }
  }

  // Update product
  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.shortDescription !== undefined) updateData.short_description = input.shortDescription
  if (input.price !== undefined) updateData.base_price = input.price
  if (input.compareAtPrice !== undefined) updateData.compare_at_price = input.compareAtPrice
  if (input.costPrice !== undefined) updateData.cost_price = input.costPrice
  if (input.sku !== undefined) updateData.sku = input.sku
  if (input.barcode !== undefined) updateData.barcode = input.barcode
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId
  if (input.status !== undefined) updateData.status = input.status
  if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured
  if (input.brand !== undefined) updateData.brand = input.brand
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.weight !== undefined) updateData.weight = input.weight

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error } = await (supabase as any)
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update variant if price changed
  if (input.price !== undefined || input.sku !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('product_variants')
      .update({
        price: input.price,
        sku: input.sku,
        compare_at_price: input.compareAtPrice,
      })
      .eq('product_id', productId)
      .eq('is_default', true)
  }

  // Update inventory if stock changed
  if (input.stock !== undefined || input.trackInventory !== undefined) {
    const { data: variantData } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
      .eq('is_default', true)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = variantData as any

    if (variant) {
      // Check if inventory exists
      const { data: existingInventory } = await supabase
        .from('inventory')
        .select('id')
        .eq('variant_id', variant.id)
        .single()

      if (existingInventory) {
        // Update existing inventory
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: inventoryError } = await (supabase as any)
          .from('inventory')
          .update({
            quantity: input.stock,
            track_inventory: input.trackInventory,
          })
          .eq('variant_id', variant.id)

        if (inventoryError) {
          console.error('Failed to update inventory:', inventoryError)
        }
      } else {
        // Create inventory if it doesn't exist
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('inventory')
          .insert({
            variant_id: variant.id,
            quantity: input.stock ?? 0,
            track_inventory: input.trackInventory ?? true,
            low_stock_threshold: 5,
          })

        if (insertError) {
          console.error('Failed to create inventory:', insertError)
        }
      }
    }
  }

  // Update images if provided
  if (images !== undefined) {
    // Delete existing images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('product_images').delete().eq('product_id', productId)

    // Insert new images
    if (images.length > 0) {
      const imageInserts = images.map((url, index) => ({
        product_id: productId,
        url,
        position: index,
        is_primary: index === 0,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('product_images').insert(imageInserts)
    }
  }

  revalidatePath('/seller/products')
  revalidatePath(`/seller/products/${productId}`)
  return { product }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get seller profile
  const { data: profileData } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileData as Pick<SellerProfile, 'id'> | null

  if (!profile) {
    return { error: 'Seller profile not found' }
  }

  // Soft delete - mark as deleted
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('products')
    .update({ status: 'deleted' })
    .eq('id', productId)
    .eq('seller_id', profile.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/seller/products')
  return { success: true }
}

export async function duplicateProduct(productId: string) {
  // Get the existing product with all details
  const { product, error: fetchError } = await getProduct(productId)

  if (fetchError || !product) {
    return { error: fetchError || 'Product not found' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any

  // Create a copy
  const { product: newProduct, error } = await createProduct(
    {
      name: `${p.name} (Copy)`,
      description: p.description,
      shortDescription: p.short_description,
      price: p.base_price,
      compareAtPrice: p.compare_at_price,
      costPrice: p.cost_price,
      sku: p.sku ? `${p.sku}-COPY` : undefined,
      barcode: undefined, // Don't copy barcode
      categoryId: p.category_id,
      status: 'draft', // Always create as draft
      isFeatured: false,
      isDigital: p.is_digital,
      requiresShipping: p.requires_shipping,
      brand: p.brand,
      tags: p.tags,
      weight: p.weight,
      stock: 0, // Start with 0 stock
      trackInventory: true,
    },
    p.product_images?.map((img: { url: string }) => img.url)
  )

  if (error) {
    return { error }
  }

  revalidatePath('/seller/products')
  return { product: newProduct }
}
