import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Disable body parsing, we need raw body for webhook signature verification
export const runtime = 'nodejs'

interface OrderItemData {
  productId: string
  variantId?: string
  quantity: number
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      try {
        await handleCheckoutComplete(session)
      } catch (error) {
        console.error('Error handling checkout complete:', error)
        return NextResponse.json(
          { error: 'Failed to process order' },
          { status: 500 }
        )
      }
      break
    }

    case 'payment_intent.succeeded': {
      // Payment confirmed - could update order status here
      console.log('Payment succeeded:', event.data.object.id)
      break
    }

    case 'payment_intent.payment_failed': {
      // Handle failed payment
      console.log('Payment failed:', event.data.object.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  // Parse metadata
  const shippingAddress = session.metadata?.shippingAddress
    ? JSON.parse(session.metadata.shippingAddress)
    : null
  const items: OrderItemData[] = session.metadata?.items
    ? JSON.parse(session.metadata.items)
    : []

  if (!items.length) {
    throw new Error('No items in checkout session')
  }

  // Get user by email
  const customerEmail = session.customer_details?.email || session.customer_email
  if (!customerEmail) {
    throw new Error('No customer email in checkout session')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userResult, error: userError } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('email', customerEmail)
    .single()

  const userData = userResult as { id: string } | null

  if (userError || !userData) {
    // User might not be logged in - create guest order or handle differently
    console.error('User not found for email:', customerEmail)
    throw new Error('User not found')
  }

  // Get product and variant details for each item
  const productIds = items.map((item) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      seller_id,
      product_variants (
        id,
        sku,
        price,
        options
      )
    `)
    .in('id', productIds)

  if (productsError || !products) {
    throw new Error('Failed to fetch products')
  }

  // Calculate totals
  let subtotal = 0
  const orderItemsData: {
    productId: string
    variantId: string
    sellerId: string
    productName: string
    variantOptions: Record<string, string> | null
    sku: string | null
    unitPrice: number
    quantity: number
  }[] = []

  for (const item of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = products.find((p: any) => p.id === item.productId) as any
    if (!product) continue

    // Find variant - if no variantId, use the first (default) variant
    let variant = product.product_variants?.find(
      (v: { id: string }) => v.id === item.variantId
    )
    if (!variant && product.product_variants?.length > 0) {
      variant = product.product_variants[0]
    }

    if (!variant) {
      console.error('No variant found for product:', item.productId)
      continue
    }

    const unitPrice = variant.price
    subtotal += unitPrice * item.quantity

    orderItemsData.push({
      productId: product.id,
      variantId: variant.id,
      sellerId: product.seller_id,
      productName: product.name,
      variantOptions: variant.options,
      sku: variant.sku,
      unitPrice,
      quantity: item.quantity,
    })
  }

  const shippingTotal = subtotal > 50 ? 0 : 4.99
  const taxTotal = subtotal * 0.1
  const grandTotal = subtotal + shippingTotal + taxTotal

  // Create order
  const orderNumber = generateOrderNumber()

  // Use Stripe's shipping address if collected, otherwise use the form address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionData = session as any
  const stripeShipping = sessionData.shipping_details?.address
  const finalShippingAddress = stripeShipping
    ? {
        firstName: sessionData.shipping_details?.name?.split(' ')[0] || '',
        lastName: sessionData.shipping_details?.name?.split(' ').slice(1).join(' ') || '',
        address: stripeShipping.line1 || '',
        apartment: stripeShipping.line2 || '',
        city: stripeShipping.city || '',
        state: stripeShipping.state || '',
        zipCode: stripeShipping.postal_code || '',
        country: stripeShipping.country || 'US',
      }
    : shippingAddress

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userData.id,
      status: 'pending',
      subtotal,
      shipping_total: shippingTotal,
      tax_total: taxTotal,
      grand_total: grandTotal,
      shipping_address: finalShippingAddress,
      billing_address: finalShippingAddress, // Use same as shipping for now
      payment_status: 'paid',
      payment_method: 'stripe',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      confirmed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Failed to create order:', orderError)
    throw new Error('Failed to create order')
  }

  // Create order items
  const commissionRate = 0.10 // 10% platform commission

  for (const item of orderItemsData) {
    const itemSubtotal = item.unitPrice * item.quantity
    const taxAmount = itemSubtotal * 0.1
    const itemTotal = itemSubtotal + taxAmount
    const commissionAmount = itemTotal * commissionRate
    const sellerAmount = itemTotal - commissionAmount

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemError } = await (supabase as any)
      .from('order_items')
      .insert({
        order_id: order.id,
        seller_id: item.sellerId,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        variant_options: item.variantOptions,
        sku: item.sku,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        tax_amount: taxAmount,
        total: itemTotal,
        commission_rate: commissionRate * 100, // Store as percentage
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: 'pending',
      })

    if (itemError) {
      console.error('Failed to create order item:', itemError)
    }

    // Update inventory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: variantData } = await (supabase as any)
      .from('product_variants')
      .select('stock')
      .eq('id', item.variantId)
      .single()

    if (variantData) {
      const newStock = Math.max(0, variantData.stock - item.quantity)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('product_variants')
        .update({ stock: newStock })
        .eq('id', item.variantId)
    }

    // Update product sales_count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: productSalesData } = await (supabase as any)
      .from('products')
      .select('sales_count')
      .eq('id', item.productId)
      .single()

    if (productSalesData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('products')
        .update({
          sales_count: (productSalesData.sales_count || 0) + item.quantity,
        })
        .eq('id', item.productId)
    }

    // Update seller stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sellerData } = await (supabase as any)
      .from('seller_profiles')
      .select('total_sales, total_revenue')
      .eq('id', item.sellerId)
      .single()

    if (sellerData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('seller_profiles')
        .update({
          total_sales: (sellerData.total_sales || 0) + 1,
          total_revenue: (sellerData.total_revenue || 0) + sellerAmount,
        })
        .eq('id', item.sellerId)
    }
  }

  console.log(`Order ${orderNumber} created successfully for user ${userData.id}`)
}
