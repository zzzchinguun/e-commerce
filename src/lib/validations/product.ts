import { z } from 'zod'

const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
})

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be less than 200 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  shortDescription: z
    .string()
    .max(500, 'Short description must be less than 500 characters')
    .optional(),
  basePrice: z
    .number()
    .positive('Price must be positive')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),
  compareAtPrice: z
    .number()
    .positive()
    .optional()
    .nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  sku: z.string().optional(),
  brand: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  tags: z.array(z.string()).optional(),
})

export const updateProductSchema = createProductSchema.partial()

export const productSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular', 'best_selling'])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
