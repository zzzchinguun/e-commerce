import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import {
  calculateOrderTotals,
  calculateOrderItemTotals,
  isValidQuantity,
  DEFAULT_COMMISSION_RATE,
} from '@/lib/pricing'

interface CheckoutItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  name: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  phone: string
}

interface ValidatedItem {
  productId: string
  variantId: string
  quantity: number
  price: number
  name: string
  sellerId: string
  commissionRate: number
  variantOptions: Record<string, string> | null
  sku: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { items, shippingAddress }: {
      items: CheckoutItem[]
      shippingAddress: ShippingAddress
      email: string
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Validate quantities
    for (const item of items) {
      if (!isValidQuantity(item.quantity)) {
        return NextResponse.json(
          { error: `Invalid quantity for product: ${item.name}` },
          { status: 400 }
        )
      }
    }

    // Get authenticated user from session (bypasses RLS issues)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login first.' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Validate prices from database - don't trust client-provided prices
    const validatedItems: ValidatedItem[] = []

    for (const item of items) {
      // Get product with seller info
      const { data: product } = await supabase
        .from('products')
        .select('id, name, seller_id, status')
        .eq('id', item.productId)
        .single()

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        )
      }

      if ((product as { status: string }).status !== 'active') {
        return NextResponse.json(
          { error: `Product is not available: ${item.name}` },
          { status: 400 }
        )
      }

      const sellerId = (product as { seller_id: string }).seller_id

      // Get seller commission rate
      const { data: seller } = await supabase
        .from('seller_profiles')
        .select('commission_rate')
        .eq('id', sellerId)
        .single()

      const commissionRate = (seller as { commission_rate: number } | null)?.commission_rate || DEFAULT_COMMISSION_RATE

      // Get variant info and price from database
      let variantId = item.variantId
      let dbPrice: number
      let variantOptions: Record<string, string> | null = null
      let sku: string | null = null

      if (variantId) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, price, sku, option_values')
          .eq('id', variantId)
          .eq('product_id', item.productId)
          .single()

        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found for product: ${item.name}` },
            { status: 400 }
          )
        }

        const v = variant as { id: string; price: number; sku: string | null; option_values: Record<string, string> | null }
        dbPrice = v.price
        variantOptions = v.option_values
        sku = v.sku
      } else {
        // Get default variant
        const { data: defaultVariant } = await supabase
          .from('product_variants')
          .select('id, price, sku, option_values')
          .eq('product_id', item.productId)
          .eq('is_default', true)
          .single()

        if (!defaultVariant) {
          // Fallback to any variant
          const { data: anyVariant } = await supabase
            .from('product_variants')
            .select('id, price, sku, option_values')
            .eq('product_id', item.productId)
            .limit(1)
            .single()

          if (!anyVariant) {
            return NextResponse.json(
              { error: `No variant available for product: ${item.name}` },
              { status: 400 }
            )
          }

          const v = anyVariant as { id: string; price: number; sku: string | null; option_values: Record<string, string> | null }
          variantId = v.id
          dbPrice = v.price
          variantOptions = v.option_values
          sku = v.sku
        } else {
          const v = defaultVariant as { id: string; price: number; sku: string | null; option_values: Record<string, string> | null }
          variantId = v.id
          dbPrice = v.price
          variantOptions = v.option_values
          sku = v.sku
        }
      }

      // Check inventory availability
      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity, allow_backorder')
        .eq('variant_id', variantId)
        .single()

      if (inventory) {
        const inv = inventory as { quantity: number; allow_backorder: boolean }
        if (inv.quantity < item.quantity && !inv.allow_backorder) {
          return NextResponse.json(
            { error: `Insufficient stock for: ${item.name}. Only ${inv.quantity} available.` },
            { status: 400 }
          )
        }
      }

      validatedItems.push({
        productId: item.productId,
        variantId: variantId!,
        quantity: item.quantity,
        price: dbPrice, // Use database price, not client price
        name: (product as { name: string }).name,
        sellerId,
        commissionRate,
        variantOptions,
        sku,
      })
    }

    // Calculate totals using validated prices
    const subtotal = validatedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const { shipping, tax, grandTotal } = calculateOrderTotals(subtotal)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Generate payment session ID for QPay simulation
    const paymentSessionId = crypto.randomUUID()

    // Create pending order
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'qpay_test',
        subtotal: subtotal,
        shipping_total: shipping,
        tax_total: tax,
        grand_total: grandTotal,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        stripe_session_id: paymentSessionId, // Using this field for our test payment ID
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items using validated data
    for (const item of validatedItems) {
      const itemTotals = calculateOrderItemTotals(
        item.price,
        item.quantity,
        item.commissionRate
      )

      // Create order item
      await (supabase as any)
        .from('order_items')
        .insert({
          order_id: order.id,
          seller_id: item.sellerId,
          product_id: item.productId,
          variant_id: item.variantId,
          product_name: item.name,
          variant_options: item.variantOptions,
          sku: item.sku,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: itemTotals.subtotal,
          tax_amount: itemTotals.taxAmount,
          total: itemTotals.total,
          commission_rate: itemTotals.commissionRate,
          commission_amount: itemTotals.commissionAmount,
          seller_amount: itemTotals.sellerAmount,
          status: 'pending',
        })
    }

    // Return payment page URL with session ID
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    return NextResponse.json({
      paymentUrl: `${origin}/checkout/qpay?session=${paymentSessionId}`,
      sessionId: paymentSessionId,
      orderNumber: orderNumber,
      amount: grandTotal,
    })
  } catch (error) {
    console.error('Test payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
