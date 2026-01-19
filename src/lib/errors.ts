/**
 * Standardized error handling utilities for server actions
 *
 * This module provides consistent error types and response patterns
 * for all server actions in the application.
 */

// ============================================
// ERROR CODES
// ============================================

export const ErrorCode = {
  // Authentication errors
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  SELLER_NOT_APPROVED: 'SELLER_NOT_APPROVED',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',

  // External service errors
  STRIPE_ERROR: 'STRIPE_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

// ============================================
// ERROR MESSAGES (Mongolian)
// ============================================

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NOT_AUTHENTICATED]: 'Нэвтрээгүй байна',
  [ErrorCode.NOT_AUTHORIZED]: 'Энэ үйлдлийг хийх эрхгүй байна',
  [ErrorCode.SESSION_EXPIRED]: 'Сессион дууссан байна. Дахин нэвтэрнэ үү',

  [ErrorCode.VALIDATION_ERROR]: 'Оруулсан мэдээлэл буруу байна',
  [ErrorCode.INVALID_INPUT]: 'Буруу утга оруулсан байна',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Шаардлагатай талбар дутуу байна',

  [ErrorCode.NOT_FOUND]: 'Мэдээлэл олдсонгүй',
  [ErrorCode.ALREADY_EXISTS]: 'Ийм мэдээлэл аль хэдийн байна',
  [ErrorCode.CONFLICT]: 'Мэдээлэл зөрчилдөж байна',

  [ErrorCode.INSUFFICIENT_INVENTORY]: 'Бараа хүрэлцэхгүй байна',
  [ErrorCode.INVALID_STATUS_TRANSITION]: 'Төлөв өөрчлөх боломжгүй байна',
  [ErrorCode.SELLER_NOT_APPROVED]: 'Худалдагчийн бүртгэл баталгаажаагүй байна',
  [ErrorCode.ORDER_NOT_CANCELLABLE]: 'Захиалга цуцлах боломжгүй байна',

  [ErrorCode.STRIPE_ERROR]: 'Төлбөрийн системд алдаа гарлаа',
  [ErrorCode.STORAGE_ERROR]: 'Файл хадгалахад алдаа гарлаа',
  [ErrorCode.DATABASE_ERROR]: 'Өгөгдлийн сангийн алдаа гарлаа',

  [ErrorCode.INTERNAL_ERROR]: 'Системийн алдаа гарлаа',
  [ErrorCode.UNKNOWN_ERROR]: 'Тодорхойгүй алдаа гарлаа',
}

// ============================================
// RESULT TYPES
// ============================================

/**
 * Standard success result type
 */
export interface SuccessResult<T> {
  success: true
  data: T
  error?: never
  code?: never
}

/**
 * Standard error result type
 */
export interface ErrorResult {
  success: false
  error: string
  code: ErrorCode
  data?: never
  details?: Record<string, string> // For validation errors
}

/**
 * Combined result type for server actions
 */
export type ActionResult<T> = SuccessResult<T> | ErrorResult

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a success result
 */
export function success<T>(data: T): SuccessResult<T> {
  return {
    success: true,
    data,
  }
}

/**
 * Create an error result
 */
export function error(
  code: ErrorCode,
  customMessage?: string,
  details?: Record<string, string>
): ErrorResult {
  return {
    success: false,
    error: customMessage || ErrorMessages[code],
    code,
    ...(details && { details }),
  }
}

/**
 * Create an authentication error
 */
export function authError(message?: string): ErrorResult {
  return error(ErrorCode.NOT_AUTHENTICATED, message)
}

/**
 * Create an authorization error
 */
export function forbiddenError(message?: string): ErrorResult {
  return error(ErrorCode.NOT_AUTHORIZED, message)
}

/**
 * Create a not found error
 */
export function notFoundError(resource?: string): ErrorResult {
  const message = resource ? `${resource} олдсонгүй` : ErrorMessages[ErrorCode.NOT_FOUND]
  return error(ErrorCode.NOT_FOUND, message)
}

/**
 * Create a validation error
 */
export function validationError(
  message?: string,
  details?: Record<string, string>
): ErrorResult {
  return error(ErrorCode.VALIDATION_ERROR, message, details)
}

/**
 * Create a database error
 */
export function dbError(originalError?: Error | string): ErrorResult {
  const message =
    typeof originalError === 'string'
      ? originalError
      : originalError?.message || ErrorMessages[ErrorCode.DATABASE_ERROR]

  // Log the original error for debugging
  if (originalError) {
    console.error('Database error:', originalError)
  }

  return error(ErrorCode.DATABASE_ERROR, message)
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<ActionResult<T>>,
  fallbackCode: ErrorCode = ErrorCode.INTERNAL_ERROR
): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (err) {
    console.error('Unexpected error:', err)
    const message = err instanceof Error ? err.message : ErrorMessages[fallbackCode]
    return error(fallbackCode, message)
  }
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(result: ActionResult<T>): result is SuccessResult<T> {
  return result.success === true
}

/**
 * Type guard to check if result is an error
 */
export function isError<T>(result: ActionResult<T>): result is ErrorResult {
  return result.success === false
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * Convert legacy { error?: string } pattern to ActionResult
 * Use this when migrating existing code
 */
export function fromLegacy<T>(
  result: { error?: string } & Partial<T>,
  dataKey?: keyof T
): ActionResult<T[keyof T] | null> {
  if (result.error) {
    return error(ErrorCode.UNKNOWN_ERROR, result.error)
  }

  const data = dataKey ? result[dataKey as keyof typeof result] : null
  return success(data as T[keyof T] | null)
}

/**
 * Convert ActionResult to legacy { error?: string } pattern
 * Use this for backwards compatibility during migration
 */
export function toLegacy<T>(
  result: ActionResult<T>,
  dataKey: string = 'data'
): { error?: string; [key: string]: T | string | undefined } {
  if (isError(result)) {
    return { error: result.error } as { error: string; [key: string]: T | string | undefined }
  }

  return { [dataKey]: result.data } as { error?: string; [key: string]: T | string | undefined }
}
