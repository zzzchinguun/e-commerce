import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateOrderTotals,
  isValidQuantity,
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingAddress, email }: {
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

    // Validate prices from database - don't trust client-provided prices
    const supabase = await createClient()
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

      // Get variant price from database
      let variantId = item.variantId
      let dbPrice: number

      if (variantId) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, price')
          .eq('id', variantId)
          .eq('product_id', item.productId)
          .single()

        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found for product: ${item.name}` },
            { status: 400 }
          )
        }

        dbPrice = (variant as { price: number }).price
      } else {
        // Get default variant
        const { data: defaultVariant } = await supabase
          .from('product_variants')
          .select('id, price')
          .eq('product_id', item.productId)
          .eq('is_default', true)
          .single()

        if (!defaultVariant) {
          // Fallback to any variant
          const { data: anyVariant } = await supabase
            .from('product_variants')
            .select('id, price')
            .eq('product_id', item.productId)
            .limit(1)
            .single()

          if (!anyVariant) {
            return NextResponse.json(
              { error: `No variant available for product: ${item.name}` },
              { status: 400 }
            )
          }

          variantId = (anyVariant as { id: string }).id
          dbPrice = (anyVariant as { price: number }).price
        } else {
          variantId = (defaultVariant as { id: string }).id
          dbPrice = (defaultVariant as { price: number }).price
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
        sellerId: (product as { seller_id: string }).seller_id,
      })
    }

    // Calculate totals using validated prices
    const subtotal = validatedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const { shipping, tax } = calculateOrderTotals(subtotal)

    // Create line items for Stripe using validated prices
    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            productId: item.productId,
            variantId: item.variantId,
          },
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item if not free
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            metadata: {
              productId: 'shipping',
              variantId: '',
            },
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Estimated Tax',
          metadata: {
            productId: 'tax',
            variantId: '',
          },
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })

    // Get the origin from the request
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: email,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
        // Store validated items with database prices
        items: JSON.stringify(validatedItems.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          sellerId: i.sellerId,
        }))),
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
