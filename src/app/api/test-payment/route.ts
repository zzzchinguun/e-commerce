import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

    // Get authenticated user from session (bypasses RLS issues)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login first.' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Calculate totals
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const shipping = subtotal > 50 ? 0 : 4.99
    const tax = subtotal * 0.1
    const grandTotal = subtotal + shipping + tax

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

    // Get product details and create order items
    for (const item of items) {
      // Get product with seller info
      const { data: productData } = await supabase
        .from('products')
        .select('id, name, seller_id')
        .eq('id', item.productId)
        .single()

      const product = productData as { id: string; name: string; seller_id: string } | null

      if (!product) continue

      // Get seller commission rate
      const { data: seller } = await supabase
        .from('seller_profiles')
        .select('id, commission_rate')
        .eq('id', product.seller_id)
        .single()

      const commissionRate = (seller as any)?.commission_rate || 10
      const itemTotal = item.price * item.quantity
      const itemTax = itemTotal * 0.1
      const totalWithTax = itemTotal + itemTax
      const commissionAmount = totalWithTax * (commissionRate / 100)
      const sellerAmount = totalWithTax - commissionAmount

      // Get variant info - use provided variantId or fetch default variant
      let variantId = item.variantId
      let variantOptions = null
      let sku = null

      if (variantId) {
        // Use provided variant
        const { data: variant } = await supabase
          .from('product_variants')
          .select('sku, option_values')
          .eq('id', variantId)
          .single()

        if (variant) {
          variantOptions = (variant as any).option_values
          sku = (variant as any).sku
        }
      } else {
        // Fetch default variant for this product (variant_id is NOT NULL in schema)
        const { data: defaultVariant } = await supabase
          .from('product_variants')
          .select('id, sku, option_values')
          .eq('product_id', item.productId)
          .eq('is_default', true)
          .single()

        if (defaultVariant) {
          variantId = (defaultVariant as any).id
          variantOptions = (defaultVariant as any).option_values
          sku = (defaultVariant as any).sku
        } else {
          // Fallback: get any variant for this product
          const { data: anyVariant } = await supabase
            .from('product_variants')
            .select('id, sku, option_values')
            .eq('product_id', item.productId)
            .limit(1)
            .single()

          if (anyVariant) {
            variantId = (anyVariant as any).id
            variantOptions = (anyVariant as any).option_values
            sku = (anyVariant as any).sku
          }
        }
      }

      // Skip if no variant found (shouldn't happen with proper product setup)
      if (!variantId) {
        console.error('No variant found for product:', item.productId)
        continue
      }

      // Create order item
      await (supabase as any)
        .from('order_items')
        .insert({
          order_id: order.id,
          seller_id: product.seller_id,
          product_id: item.productId,
          variant_id: variantId,
          product_name: item.name,
          variant_options: variantOptions,
          sku: sku,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: itemTotal,
          tax_amount: itemTax,
          total: totalWithTax,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_amount: sellerAmount,
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
