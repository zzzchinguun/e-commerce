/**
 * Centralized pricing utilities for consistent calculations across the application.
 * Used in checkout APIs, webhooks, and payment processing.
 */

// Tax rate (10%)
export const TAX_RATE = 0.10

// Free shipping threshold in USD
export const FREE_SHIPPING_THRESHOLD = 50

// Default shipping cost in USD
export const DEFAULT_SHIPPING_COST = 4.99

// Default commission rate for sellers (10%)
export const DEFAULT_COMMISSION_RATE = 10

/**
 * Calculate tax amount for a given subtotal
 */
export function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE
}

/**
 * Calculate shipping cost based on subtotal
 * Free shipping for orders over the threshold
 */
export function calculateShipping(subtotal: number): number {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST
}

/**
 * Calculate commission amount for a seller
 * @param total - Total amount including tax
 * @param commissionRate - Commission rate as percentage (e.g., 10 for 10%)
 */
export function calculateCommission(total: number, commissionRate: number): number {
  return total * (commissionRate / 100)
}

/**
 * Calculate seller amount after commission deduction
 * @param total - Total amount including tax
 * @param commissionRate - Commission rate as percentage (e.g., 10 for 10%)
 */
export function calculateSellerAmount(total: number, commissionRate: number): number {
  const commission = calculateCommission(total, commissionRate)
  return total - commission
}

/**
 * Calculate all order totals from subtotal
 */
export function calculateOrderTotals(subtotal: number): {
  subtotal: number
  shipping: number
  tax: number
  grandTotal: number
} {
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const grandTotal = subtotal + shipping + tax

  return {
    subtotal,
    shipping,
    tax,
    grandTotal,
  }
}

/**
 * Calculate order item totals with commission
 * @param unitPrice - Price per unit
 * @param quantity - Number of units
 * @param commissionRate - Commission rate as percentage
 */
export function calculateOrderItemTotals(
  unitPrice: number,
  quantity: number,
  commissionRate: number = DEFAULT_COMMISSION_RATE
): {
  subtotal: number
  taxAmount: number
  total: number
  commissionRate: number
  commissionAmount: number
  sellerAmount: number
} {
  const subtotal = unitPrice * quantity
  const taxAmount = calculateTax(subtotal)
  const total = subtotal + taxAmount
  const commissionAmount = calculateCommission(total, commissionRate)
  const sellerAmount = total - commissionAmount

  return {
    subtotal,
    taxAmount,
    total,
    commissionRate,
    commissionAmount,
    sellerAmount,
  }
}

/**
 * Validate that a price is valid (positive number)
 */
export function isValidPrice(price: unknown): price is number {
  return typeof price === 'number' && price > 0 && Number.isFinite(price)
}

/**
 * Validate that a quantity is valid (positive integer)
 */
export function isValidQuantity(quantity: unknown): quantity is number {
  return typeof quantity === 'number' && quantity > 0 && Number.isInteger(quantity)
}
