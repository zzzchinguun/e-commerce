/**
 * Seed Script for E-Commerce Database
 *
 * Creates test users, sellers, categories, and products.
 * Uses Supabase Admin API to bypass email verification.
 *
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Test Data Configuration
const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: 'Laptop', description: 'Phones, laptops, gadgets and more' },
  { name: 'Clothing', slug: 'clothing', icon: 'Shirt', description: 'Fashion for men, women and kids' },
  { name: 'Home & Garden', slug: 'home-garden', icon: 'Home', description: 'Furniture, decor and garden supplies' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'Dumbbell', description: 'Sports equipment and outdoor gear' },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: 'Heart', description: 'Skincare, makeup and wellness products' },
  { name: 'Books', slug: 'books', icon: 'BookOpen', description: 'Books, ebooks and literature' },
  { name: 'Toys & Games', slug: 'toys-games', icon: 'Gamepad2', description: 'Toys, games and entertainment' },
  { name: 'Automotive', slug: 'automotive', icon: 'Package', description: 'Car parts, accessories and tools' },
]

const SELLERS = [
  {
    email: 'techstore@test.com',
    password: 'Test123!',
    fullName: 'Tech Store Owner',
    storeName: 'TechZone Electronics',
    storeSlug: 'techzone-electronics',
    storeDescription: 'Your one-stop shop for the latest electronics and gadgets',
  },
  {
    email: 'fashionhub@test.com',
    password: 'Test123!',
    fullName: 'Fashion Hub Owner',
    storeName: 'Fashion Hub',
    storeSlug: 'fashion-hub',
    storeDescription: 'Trendy clothing and accessories for all occasions',
  },
  {
    email: 'homeessentials@test.com',
    password: 'Test123!',
    fullName: 'Home Essentials Owner',
    storeName: 'Home Essentials',
    storeSlug: 'home-essentials',
    storeDescription: 'Quality home and garden products for your living space',
  },
]

// Products per seller/category
const PRODUCTS = {
  'techzone-electronics': {
    category: 'electronics',
    items: [
      {
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        description: 'Premium noise-canceling wireless headphones with 30-hour battery life. Features include active noise cancellation, comfortable over-ear design, and crystal-clear audio quality.',
        price: 149.99,
        compareAtPrice: 199.99,
        image: 'https://picsum.photos/seed/headphones/600/600',
        tags: ['electronics', 'audio', 'wireless'],
        isFeatured: true,
      },
      {
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Water-resistant up to 50 meters.',
        price: 299.99,
        compareAtPrice: 349.99,
        image: 'https://picsum.photos/seed/smartwatch/600/600',
        tags: ['electronics', 'wearable', 'fitness'],
        isFeatured: true,
      },
      {
        name: 'Portable Power Bank 20000mAh',
        slug: 'portable-power-bank-20000mah',
        description: 'High-capacity portable charger with fast charging support. Charges phones up to 5 times. Dual USB-C and USB-A ports.',
        price: 49.99,
        compareAtPrice: null,
        image: 'https://picsum.photos/seed/powerbank/600/600',
        tags: ['electronics', 'accessories', 'charging'],
        isFeatured: false,
      },
      {
        name: 'Wireless Charging Pad',
        slug: 'wireless-charging-pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
        price: 29.99,
        compareAtPrice: 39.99,
        image: 'https://picsum.photos/seed/charger/600/600',
        tags: ['electronics', 'accessories', 'charging'],
        isFeatured: false,
      },
      {
        name: 'USB-C Hub 7-in-1',
        slug: 'usb-c-hub-7-in-1',
        description: 'Expand your laptop connectivity with this versatile hub featuring HDMI, USB-A, USB-C, SD card reader, and ethernet ports.',
        price: 59.99,
        compareAtPrice: 79.99,
        image: 'https://picsum.photos/seed/usbhub/600/600',
        tags: ['electronics', 'accessories', 'laptop'],
        isFeatured: false,
      },
    ],
  },
  'fashion-hub': {
    category: 'clothing',
    items: [
      {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-tshirt',
        description: 'Premium 100% organic cotton t-shirt. Comfortable fit, pre-shrunk fabric, available in multiple colors. Perfect for everyday wear.',
        price: 29.99,
        compareAtPrice: null,
        image: 'https://picsum.photos/seed/tshirt/600/600',
        tags: ['clothing', 'casual', 'basics'],
        isFeatured: true,
      },
      {
        name: 'Slim Fit Denim Jeans',
        slug: 'slim-fit-denim-jeans',
        description: 'Classic slim-fit jeans made from premium stretch denim. Comfortable all-day wear with modern styling.',
        price: 79.99,
        compareAtPrice: 99.99,
        image: 'https://picsum.photos/seed/jeans/600/600',
        tags: ['clothing', 'denim', 'casual'],
        isFeatured: true,
      },
      {
        name: 'Cozy Hoodie Sweatshirt',
        slug: 'cozy-hoodie-sweatshirt',
        description: 'Ultra-soft fleece-lined hoodie perfect for lounging or layering. Features kangaroo pocket and adjustable drawstring hood.',
        price: 54.99,
        compareAtPrice: 69.99,
        image: 'https://picsum.photos/seed/hoodie/600/600',
        tags: ['clothing', 'casual', 'comfort'],
        isFeatured: false,
      },
      {
        name: 'Athletic Running Shorts',
        slug: 'athletic-running-shorts',
        description: 'Lightweight moisture-wicking shorts with built-in liner. Perfect for running, gym, or casual wear.',
        price: 34.99,
        compareAtPrice: null,
        image: 'https://picsum.photos/seed/shorts/600/600',
        tags: ['clothing', 'athletic', 'fitness'],
        isFeatured: false,
      },
      {
        name: 'Winter Puffer Jacket',
        slug: 'winter-puffer-jacket',
        description: 'Warm and stylish puffer jacket with water-resistant outer shell. Lightweight insulation keeps you warm without bulk.',
        price: 129.99,
        compareAtPrice: 179.99,
        image: 'https://picsum.photos/seed/jacket/600/600',
        tags: ['clothing', 'outerwear', 'winter'],
        isFeatured: true,
      },
    ],
  },
  'home-essentials': {
    category: 'home-garden',
    items: [
      {
        name: 'Memory Foam Pillow Set',
        slug: 'memory-foam-pillow-set',
        description: 'Set of 2 premium memory foam pillows with cooling gel technology. Hypoallergenic and machine washable covers.',
        price: 69.99,
        compareAtPrice: 89.99,
        image: 'https://picsum.photos/seed/pillow/600/600',
        tags: ['home', 'bedding', 'comfort'],
        isFeatured: true,
      },
      {
        name: 'Stainless Steel Cookware Set',
        slug: 'stainless-steel-cookware-set',
        description: '10-piece professional-grade stainless steel cookware set. Oven safe, dishwasher safe, and compatible with all stovetops.',
        price: 199.99,
        compareAtPrice: 299.99,
        image: 'https://picsum.photos/seed/cookware/600/600',
        tags: ['home', 'kitchen', 'cooking'],
        isFeatured: true,
      },
      {
        name: 'LED Desk Lamp',
        slug: 'led-desk-lamp',
        description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port and flexible neck.',
        price: 44.99,
        compareAtPrice: null,
        image: 'https://picsum.photos/seed/lamp/600/600',
        tags: ['home', 'lighting', 'office'],
        isFeatured: false,
      },
      {
        name: 'Indoor Plant Pot Set',
        slug: 'indoor-plant-pot-set',
        description: 'Set of 3 modern ceramic plant pots with drainage holes and bamboo trays. Perfect for succulents and small plants.',
        price: 39.99,
        compareAtPrice: 54.99,
        image: 'https://picsum.photos/seed/plantpot/600/600',
        tags: ['home', 'garden', 'decor'],
        isFeatured: false,
      },
      {
        name: 'Bamboo Bathroom Organizer',
        slug: 'bamboo-bathroom-organizer',
        description: 'Eco-friendly bamboo bathroom organizer with multiple compartments. Water-resistant finish, perfect for countertops.',
        price: 34.99,
        compareAtPrice: null,
        image: 'https://picsum.photos/seed/organizer/600/600',
        tags: ['home', 'bathroom', 'organization'],
        isFeatured: false,
      },
    ],
  },
}

// Helper function to generate slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function seed() {
  console.log('🌱 Starting seed process...\n')

  // Step 1: Create Categories
  console.log('📁 Creating categories...')
  const categoryMap: Record<string, string> = {}

  for (const category of CATEGORIES) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category.slug)
      .single()

    if (existing) {
      console.log(`  ✓ Category "${category.name}" already exists`)
      categoryMap[category.slug] = existing.id
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          description: category.description,
          is_active: true,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`  ✗ Failed to create category "${category.name}":`, error.message)
      } else {
        console.log(`  ✓ Created category "${category.name}"`)
        categoryMap[category.slug] = data.id
      }
    }
  }

  console.log('')

  // Step 2: Create Sellers (Users + Seller Profiles)
  console.log('👤 Creating sellers...')
  const sellerMap: Record<string, string> = {}

  for (const seller of SELLERS) {
    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', seller.email)

    if (existingUsers && existingUsers.length > 0) {
      console.log(`  ✓ Seller "${seller.storeName}" already exists`)

      // Get seller profile ID
      const { data: profile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', existingUsers[0].id)
        .single()

      if (profile) {
        sellerMap[seller.storeSlug] = profile.id
      }
      continue
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: seller.email,
      password: seller.password,
      email_confirm: true,
      user_metadata: {
        full_name: seller.fullName,
      },
    })

    if (authError) {
      console.error(`  ✗ Failed to create user for "${seller.storeName}":`, authError.message)
      continue
    }

    const userId = authData.user.id

    // Update user role to seller
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'seller', full_name: seller.fullName })
      .eq('id', userId)

    if (userError) {
      console.error(`  ✗ Failed to update user role:`, userError.message)
    }

    // Create seller profile
    const { data: profileData, error: profileError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: userId,
        store_name: seller.storeName,
        store_slug: seller.storeSlug,
        store_description: seller.storeDescription,
        status: 'approved',
        stripe_onboarding_complete: true, // For demo purposes
      })
      .select('id')
      .single()

    if (profileError) {
      console.error(`  ✗ Failed to create seller profile:`, profileError.message)
    } else {
      console.log(`  ✓ Created seller "${seller.storeName}" (${seller.email})`)
      sellerMap[seller.storeSlug] = profileData.id
    }
  }

  console.log('')

  // Step 3: Create Products
  console.log('📦 Creating products...')

  for (const [storeSlug, productData] of Object.entries(PRODUCTS)) {
    const sellerId = sellerMap[storeSlug]
    const categoryId = categoryMap[productData.category]

    if (!sellerId) {
      console.log(`  ⚠ Skipping products for "${storeSlug}" - seller not found`)
      continue
    }

    for (const product of productData.items) {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', product.slug)
        .single()

      if (existing) {
        console.log(`  ✓ Product "${product.name}" already exists`)
        continue
      }

      // Create product
      const { data: productRecord, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: sellerId,
          category_id: categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          base_price: product.price,
          compare_at_price: product.compareAtPrice,
          status: 'active',
          is_featured: product.isFeatured,
          tags: product.tags,
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (productError) {
        console.error(`  ✗ Failed to create product "${product.name}":`, productError.message)
        continue
      }

      // Create default variant
      const { data: variantRecord, error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: productRecord.id,
          price: product.price,
          compare_at_price: product.compareAtPrice,
          is_default: true,
          option_values: {},
        })
        .select('id')
        .single()

      if (variantError) {
        console.error(`  ✗ Failed to create variant for "${product.name}":`, variantError.message)
      } else {
        // Create inventory for variant
        await supabase
          .from('inventory')
          .insert({
            variant_id: variantRecord.id,
            quantity: Math.floor(Math.random() * 100) + 20, // Random stock 20-120
            low_stock_threshold: 10,
            track_inventory: true,
          })
      }

      // Create product image
      const { error: imageError } = await supabase
        .from('product_images')
        .insert({
          product_id: productRecord.id,
          url: product.image,
          alt_text: product.name,
          position: 0,
          is_primary: true,
        })

      if (imageError) {
        console.error(`  ✗ Failed to create image for "${product.name}":`, imageError.message)
      }

      console.log(`  ✓ Created product "${product.name}"`)
    }
  }

  console.log('')

  // Step 4: Create a test customer
  console.log('🧑 Creating test customer...')

  const testCustomerEmail = 'customer@test.com'
  const { data: existingCustomer } = await supabase
    .from('users')
    .select('id')
    .eq('email', testCustomerEmail)

  if (existingCustomer && existingCustomer.length > 0) {
    console.log(`  ✓ Test customer already exists`)
  } else {
    const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
      email: testCustomerEmail,
      password: 'Test123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Customer',
      },
    })

    if (customerAuthError) {
      console.error(`  ✗ Failed to create test customer:`, customerAuthError.message)
    } else {
      // Update full name
      await supabase
        .from('users')
        .update({ full_name: 'Test Customer' })
        .eq('id', customerAuth.user.id)

      console.log(`  ✓ Created test customer (customer@test.com / Test123!)`)
    }
  }

  console.log('')
  console.log('✅ Seed process complete!')
  console.log('')
  console.log('📝 Test Accounts:')
  console.log('─'.repeat(50))
  console.log('Customer:')
  console.log('  Email: customer@test.com')
  console.log('  Password: Test123!')
  console.log('')
  console.log('Sellers:')
  for (const seller of SELLERS) {
    console.log(`  ${seller.storeName}:`)
    console.log(`    Email: ${seller.email}`)
    console.log(`    Password: ${seller.password}`)
  }
}

// Run the seed
seed().catch(console.error)
