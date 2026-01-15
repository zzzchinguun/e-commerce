import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

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

    // Calculate totals
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const shipping = subtotal > 50 ? 0 : 4.99
    const tax = subtotal * 0.1

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            productId: item.productId,
            variantId: item.variantId || '',
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
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
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
