import { z } from 'zod'

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  streetAddress2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('US'),
  label: z.string().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
})

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().positive().default(1),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
})

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>
