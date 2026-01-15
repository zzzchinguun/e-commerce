'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database'

type SellerProfile = Tables<'seller_profiles'>
type Product = Tables<'products'>

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

  // Build query
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
      product_variants (
        id,
        sku,
        price,
        inventory (
          quantity,
          reserved_quantity
        )
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

  // Transform data to include stock info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts = items?.map((product: any) => {
    const defaultVariant = product.product_variants?.[0]
    const inventory = defaultVariant?.inventory?.[0]

    return {
      ...product,
      stock: inventory?.quantity ?? 0,
      reservedStock: inventory?.reserved_quantity ?? 0,
      mainImage: product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.url ||
        product.product_images?.[0]?.url || null,
    }
  })

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
        option_values,
        inventory (
          quantity,
          reserved_quantity,
          low_stock_threshold,
          track_inventory
        )
      )
    `)
    .eq('id', productId)
    .eq('seller_id', profile.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { product }
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
  const { error: inventoryError } = await (supabase as any)
    .from('inventory')
    .insert({
      variant_id: variant.id,
      quantity: input.stock || 0,
      track_inventory: input.trackInventory ?? true,
      low_stock_threshold: 5,
    })

  if (inventoryError) {
    console.error('Failed to create inventory:', inventoryError)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('inventory')
        .update({
          quantity: input.stock,
          track_inventory: input.trackInventory,
        })
        .eq('variant_id', variant.id)
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
