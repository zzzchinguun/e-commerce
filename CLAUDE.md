# E-Commerce Multi-Vendor Marketplace

## Project Overview

Amazon-like multi-vendor marketplace built with Next.js 14, Tailwind CSS, Supabase (PostgreSQL), and Stripe payments.

---

## Quick Start Guide

### 1. Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Stripe account (for payments)

### 2. Environment Setup

Create `.env.local` in project root:

```bash
# Supabase (get from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Stripe (get from Stripe Dashboard > Developers > API keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional for local dev

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Cron job secret (required for Vercel cron)
CRON_SECRET=your-secure-random-string
```

### 3. Database Setup (Supabase)

Run these SQL scripts in order in Supabase SQL Editor:

**Step 1: Run the main schema** (creates all tables, types, functions, triggers)
- This is the large SQL script with all CREATE statements

**Step 2: RLS policies are included in the schema**
- Row Level Security is enabled automatically

**Step 3: Seed data is included at the end**
- Categories are auto-inserted

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Name: `products`
4. Make it **Public** (toggle on)
5. Click **Create bucket**

Set bucket policy (in SQL Editor):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow public to view images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

### 5. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Testing the Application

### Test Flow 1: Customer Journey

1. **Sign Up** → `/signup`
   - Create account with email/password
   - Check Supabase Auth > Users to verify

2. **Browse Products** → `/products`
   - (Will be empty until sellers add products)

3. **Add to Cart** → Click "Add to Cart" on any product
   - Cart persists in localStorage

4. **Checkout** → `/checkout`
   - Requires Stripe setup

### Test Flow 2: Seller Journey

1. **Sign Up as Customer First** → `/signup`

2. **Register as Seller** → `/seller/register`
   - Fill in store details
   - Submit application

3. **Approve Seller (Manual Step)**
   In Supabase SQL Editor:
   ```sql
   -- Find your seller profile
   SELECT * FROM seller_profiles;

   -- Approve it (replace YOUR_SELLER_ID)
   UPDATE seller_profiles
   SET status = 'approved'
   WHERE id = 'YOUR_SELLER_ID';
   ```

4. **Access Seller Dashboard** → `/seller`
   - Now you can add products, manage orders

5. **Add a Product** → `/seller/products/new`
   - Fill in product details
   - Upload images
   - Set status to "Active"
   - Click Create

6. **View Your Product** → `/products`
   - Product should appear in listing

### Test Flow 3: Admin Tasks (via SQL)

**Approve a seller:**
```sql
UPDATE seller_profiles SET status = 'approved' WHERE store_slug = 'store-name';
```

**Make a user admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

**View all orders:**
```sql
SELECT o.order_number, o.status, o.grand_total, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```

**View seller earnings:**
```sql
SELECT
  sp.store_name,
  sp.total_revenue,
  sp.total_sales,
  COUNT(oi.id) as pending_orders
FROM seller_profiles sp
LEFT JOIN order_items oi ON oi.seller_id = sp.id AND oi.status = 'pending'
GROUP BY sp.id;
```

### Test Flow 4: Test Payment (No Real Money)

1. **Add Products to Cart** → Browse products and add to cart
2. **Go to Checkout** → `/checkout`
3. **Fill in Details** → Enter shipping info
4. **Select QPay** → QPay (QR код) is selected by default
5. **Submit** → Click "QPay-ээр төлөх"
6. **Simulate Payment** → On QPay page, click "Төлбөр төлөгдсөн (Тест)"
7. **View Success** → Redirected to success page
8. **Check Order** → View in `/account/orders` or verify in Supabase

---

## Common Issues & Fixes

### Issue: "Not authenticated" error
- Make sure you're logged in
- Check that cookies are enabled
- Try logging out and back in

### Issue: "Seller profile not found"
- Go to `/seller/register` first
- Make sure registration completed successfully

### Issue: "Your seller account is not approved yet"
- Run the SQL to approve your seller (see Test Flow 2, Step 3)

### Issue: Image upload fails
- Verify storage bucket `products` exists
- Check bucket is set to Public
- Verify storage policies are created

### Issue: Products not showing on `/products`
- Check product status is `active` (not `draft`)
- Check seller status is `approved`
- Verify RLS policies allow public viewing

### Issue: TypeScript errors with Supabase
- This is expected for complex queries
- We use `(supabase as any)` as workaround
- Don't remove the eslint-disable comments

### Issue: Google OAuth not working
- Configure in Supabase Dashboard > Authentication > Providers > Google
- Add OAuth credentials from Google Cloud Console
- Set redirect URL to `https://your-project.supabase.co/auth/v1/callback`

---

## Supabase Auth Configuration

### Email Auth (Default)
Already enabled. Configure in Supabase Dashboard > Authentication > Providers > Email.

Options to consider:
- **Confirm email**: Toggle off for easier testing
- **Secure email change**: Keep enabled for production

### Google OAuth (Optional)

1. **Google Cloud Console**:
   - Create project at console.cloud.google.com
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Paste Client ID and Client Secret

### Auth Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration:
- **Site URL**: `http://localhost:3000` (or your production URL)
- **Redirect URLs**: Add all valid redirect destinations:
  ```
  http://localhost:3000/**
  https://your-domain.com/**
  ```

---

## Test Payment (QPay Simulation)

For testing the checkout flow without real payments, a simulated QPay payment system is available.

### How It Works

1. **Checkout**: Select "QPay (QR код)" payment method (default)
2. **Payment Page**: Redirects to `/checkout/qpay?session=<uuid>`
3. **Simulated QR**: Shows a fake QR code with bank logos
4. **Test Button**: Click "Төлбөр төлөгдсөн (Тест)" to simulate payment
5. **Order Completion**: Updates order status, inventory, and seller stats

### Files Involved

- `/src/app/api/test-payment/route.ts` - Creates pending order, generates session
- `/src/app/(main)/checkout/qpay/page.tsx` - QPay payment page with Suspense
- `/src/app/(main)/checkout/qpay/QPayPaymentContent.tsx` - QR display and test button
- `/src/actions/test-payment.ts` - Server actions for payment details and confirmation
- `/src/components/checkout/CheckoutForm.tsx` - Payment method selection (QPay vs Stripe)

### Order Flow

1. Customer submits checkout form with QPay selected
2. API creates order with `payment_method: 'qpay_test'` and `payment_status: 'pending'`
3. Session ID stored in `stripe_session_id` field
4. Customer clicks test payment button
5. Server action updates: `payment_status: 'paid'`, decrements inventory, updates seller stats, increments product `sales_count`
6. Customer redirected to success page

---

## Sales Count Tracking

Product sales are tracked via the `products.sales_count` column, which is automatically updated when orders are paid.

### Automatic Updates

Sales count is incremented in two places:
1. **QPay Test Payment** (`/src/actions/test-payment.ts`) - On `confirmTestPayment()`
2. **Stripe Webhook** (`/src/app/api/webhooks/stripe/route.ts`) - On `checkout.session.completed`

Both increment `sales_count` by the quantity purchased for each product in the order.

### Data Reconciliation

A nightly cron job reconciles `sales_count` to ensure data integrity:

**Endpoint:** `/api/cron/nightly`
**Schedule:** Daily at 2:00 AM Mongolia time (18:00 UTC)
**Config:** `vercel.json`

The reconciliation:
1. Aggregates actual sales from `order_items` where `orders.payment_status` is 'paid' or 'succeeded'
2. Updates each product's `sales_count` to match the aggregated total
3. Resets products with no sales to 0
4. Logs the action to `admin_audit_log`

### Manual Reconciliation

Admins can manually trigger reconciliation from:
- **URL:** `/admin/maintenance`
- **Action:** Click "Гараар ажиллуулах" (Run manually)

### Files Involved

- `/src/actions/admin.ts` - `reconcileProductSalesCounts()`, `reconcileProductSalesCountsInternal()`
- `/src/app/admin/maintenance/page.tsx` - Admin maintenance UI
- `/src/app/api/cron/nightly/route.ts` - Cron endpoint
- `vercel.json` - Cron schedule configuration

### Order Cancellation & Refunds

Order cancellation and refund processing is fully implemented with the following side effects:

**When an order item is cancelled:**
1. Inventory is restored (`inventory.quantity` incremented)
2. Product `sales_count` is decremented
3. Seller `total_sales` is decremented
4. Seller `total_revenue` is reduced by `seller_amount`

**Files involved:**
- `/src/actions/orders.ts` - `handleOrderItemCancellation()` helper in `updateOrderStatus()`
- `/src/actions/admin.ts` - `processOrderRefund()` for admin refund processing

**Admin Refund Processing:**
- Admins can process refunds from `/admin/orders`
- Creates Stripe refund via `payment_intent` if Stripe payment
- Updates order and payment status to 'refunded'
- Restores inventory and decrements all statistics
- Logs action to `admin_audit_log`

---

## Stripe Configuration (For Payments)

### 1. Get API Keys

From Stripe Dashboard > Developers > API keys:
- Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key → `STRIPE_SECRET_KEY`

### 2. Webhook Setup (For Production)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Stripe Connect (For Seller Payouts)

For multi-vendor payouts, you need Stripe Connect:
1. Enable Connect in Stripe Dashboard
2. Sellers will onboard via Stripe Connect Express
3. Platform takes commission, rest goes to seller

*Note: Connect integration is planned but not yet implemented.*

---

## Regenerating Supabase Types

When you change the database schema, regenerate TypeScript types:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Generate types (replace with your project ref)
supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts
```

Or use the Supabase Dashboard:
1. Go to Project Settings > API
2. Scroll to "Generating Types"
3. Copy the generated types

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Payments | Stripe (Checkout + Connect for sellers) |
| State | Zustand (cart, wishlist, UI) |
| Forms | React Hook Form + Zod |
| Analytics | Google Analytics 4 |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, forgot-password, reset-password
│   ├── (main)/           # Public pages (home, products, cart, checkout)
│   │   └── checkout/
│   │       ├── page.tsx          # Checkout form
│   │       ├── qpay/             # QPay test payment
│   │       │   ├── page.tsx      # Suspense wrapper
│   │       │   └── QPayPaymentContent.tsx
│   │       └── success/          # Order success
│   ├── (protected)/      # User account pages (orders, addresses, settings)
│   ├── (admin)/          # Super admin dashboard
│   │   ├── layout.tsx    # Admin sidebar layout
│   │   ├── page.tsx      # Dashboard home
│   │   ├── users/        # User management
│   │   ├── sellers/      # Seller management
│   │   ├── products/     # Product moderation
│   │   ├── orders/       # Order management (with refund processing)
│   │   ├── analytics/    # Platform analytics
│   │   ├── audit-log/    # Admin audit log viewer
│   │   ├── maintenance/  # System maintenance actions
│   │   └── settings/     # Platform settings
│   ├── seller/           # Seller dashboard (products, orders, analytics)
│   └── api/              # API routes
│       ├── checkout/     # Stripe checkout
│       ├── cron/         # Scheduled jobs (nightly maintenance)
│       ├── test-payment/ # QPay test payment
│       └── webhooks/     # Stripe webhooks
├── actions/              # Server Actions
│   ├── seller.ts         # Seller profile CRUD
│   ├── products.ts       # Product CRUD for sellers
│   ├── orders.ts         # Order management for sellers
│   ├── categories.ts     # Category fetching
│   ├── test-payment.ts   # QPay test payment confirmation
│   ├── admin.ts          # Admin dashboard actions (refunds, audit log, etc.)
│   ├── addresses.ts      # User address CRUD
│   └── analytics.ts      # Seller analytics
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer, navigation
│   ├── products/         # ProductCard, ProductGrid
│   ├── cart/             # CartDrawer, CartItem
│   ├── checkout/         # CheckoutForm, StripeProvider
│   └── admin/            # Admin components (ImpersonationBanner, PendingSellerCard, etc.)
├── lib/
│   ├── supabase/         # client.ts, server.ts
│   ├── stripe/           # Stripe configuration
│   ├── admin/            # Admin utilities (impersonation)
│   ├── pricing.ts        # Centralized pricing calculations (tax, shipping, commission)
│   ├── errors.ts         # Standardized error handling utilities
│   └── utils/            # Utility functions (format.ts)
├── stores/               # Zustand stores
│   ├── cart-store.ts     # Shopping cart with localStorage
│   └── wishlist-store.ts # Wishlist functionality
└── types/
    └── database.ts       # Supabase generated types
```

## Database Schema

The schema uses PostgreSQL with custom ENUM types for type safety.

### Custom Types (ENUMs)

```sql
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'returned');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock', 'deleted');
```

### Core Tables

1. **users** - Extended from auth.users (auto-created via trigger)
   - `id` (UUID, references auth.users)
   - `email`, `full_name`, `phone`, `avatar_url`
   - `role`: user_role ENUM
   - `stripe_customer_id`, `email_verified`, `is_active`
   - `last_login_at`, `created_at`, `updated_at`

2. **seller_profiles** - Store information
   - `id` (UUID), `user_id` (unique per user)
   - `store_name`, `store_slug` (unique), `store_description`
   - `store_logo_url`, `store_banner_url`
   - `business_email`, `business_phone`, `business_address` (JSONB)
   - `stripe_account_id`, `stripe_onboarding_complete`
   - `commission_rate` (default 10.00)
   - `status`: seller_status ENUM
   - `rating_average`, `rating_count`, `total_sales`, `total_revenue`

3. **user_addresses** - Multiple addresses per user
   - `user_id`, `label`, `recipient_name`, `phone`
   - `street_address`, `street_address_2`, `city`, `state`, `postal_code`, `country`
   - `is_default_shipping`, `is_default_billing`

4. **categories** - Hierarchical product categories
   - `id`, `parent_id` (self-reference)
   - `name`, `slug` (unique), `description`, `image_url`, `icon`
   - `sort_order`, `is_active`

5. **products** - Product catalog
   - `id`, `seller_id`, `category_id`
   - `name`, `slug` (unique per seller), `description`, `short_description`
   - `base_price`, `compare_at_price`, `cost_price`
   - `sku`, `barcode`, `weight`, `dimensions` (JSONB)
   - `status`: product_status ENUM
   - `is_featured`, `is_digital`, `requires_shipping`
   - `brand`, `tags` (TEXT[])
   - `rating_average`, `rating_count`, `view_count`, `sales_count`
   - `published_at`

6. **product_variants** - SKU/price per variant
   - `id`, `product_id`
   - `sku`, `barcode`
   - `price`, `compare_at_price`, `cost_price`, `weight`
   - `option_values` (JSONB, default '{}')
   - `position`, `is_default`

7. **inventory** - Stock tracking (unique per variant)
   - `id`, `variant_id` (unique)
   - `quantity`, `reserved_quantity`
   - `low_stock_threshold` (default 5)
   - `track_inventory`, `allow_backorder`

8. **product_images** - Multiple images per product
   - `id`, `product_id`, `variant_id` (optional)
   - `url`, `alt_text`, `position`, `is_primary`

### Shopping & Orders

9. **cart_items** - Shopping cart (unique user+variant)
   - `user_id`, `variant_id`, `quantity`
   - `saved_for_later`

10. **wishlists** - Named wishlists per user
    - `user_id`, `name` (default 'My Wishlist'), `is_public`

11. **wishlist_items** - Items in wishlists
    - `wishlist_id`, `product_id`, `variant_id`
    - `notes`, `priority`

12. **orders** - Order records (auto-generated order_number)
    - `id`, `order_number` (unique, auto-generated)
    - `user_id`
    - `status`: order_status ENUM
    - `subtotal`, `shipping_total`, `tax_total`, `discount_total`, `grand_total`
    - `currency` (default 'USD')
    - `shipping_address`, `billing_address` (JSONB)
    - `shipping_method`, `shipping_carrier`, `tracking_number`
    - `estimated_delivery_date`
    - `payment_status`: payment_status ENUM
    - `payment_method`, `stripe_session_id`, `stripe_payment_intent_id`
    - `notes`, `internal_notes`
    - `confirmed_at`, `shipped_at`, `delivered_at`, `cancelled_at`

13. **order_items** - Line items grouped by seller
    - `order_id`, `seller_id`, `product_id`, `variant_id`
    - `product_name`, `variant_options` (JSONB), `sku`
    - `unit_price`, `quantity`, `subtotal`
    - `tax_amount`, `discount_amount`, `total`
    - `commission_rate`, `commission_amount`, `seller_amount`
    - `status`: order_status ENUM (per-seller fulfillment)

14. **payments** - Stripe payment records
    - `order_id`, `user_id`
    - `stripe_payment_intent_id` (unique), `stripe_charge_id`
    - `amount`, `currency`, `status`: payment_status ENUM
    - `payment_method`, `card_brand`, `card_last_four`
    - `failure_reason`, `metadata` (JSONB)

15. **seller_payouts** - Stripe Connect transfers
    - `seller_id`, `stripe_transfer_id` (unique)
    - `amount`, `currency`, `status`
    - `period_start`, `period_end`, `order_item_ids` (UUID[])
    - `notes`, `processed_at`, `failure_reason`

### Reviews & Analytics

16. **product_reviews** - Ratings and comments (unique user+product)
    - `product_id`, `user_id`, `order_item_id`
    - `rating` (1-5), `title`, `content`
    - `pros`, `cons` (TEXT[])
    - `is_verified_purchase`, `is_approved`
    - `helpful_votes`, `unhelpful_votes`
    - `seller_response`, `seller_responded_at`

17. **review_votes** - Helpful/unhelpful votes (unique user+review)
    - `review_id`, `user_id`, `is_helpful`

18. **product_views** - View tracking
    - `product_id`, `user_id`, `session_id`
    - `ip_address`, `user_agent`, `referrer`

19. **notifications** - User notifications
    - `user_id`, `type`, `title`, `message`
    - `data` (JSONB), `is_read`, `read_at`

### Homepage & Marketing Tables

20. **hero_banners** - Homepage hero section banners
    - `id`, `title`, `subtitle`, `button_text`, `button_link`
    - `image_url`, `background_color` (default '#f97316')
    - `position` (default 0), `is_active` (default true)
    - `start_date`, `end_date` (for scheduled banners)
    - `click_count` (default 0)
    - `created_at`, `updated_at`

21. **featured_categories** - Homepage featured category cards
    - `id`, `category_id` (references categories)
    - `custom_title` (optional), `custom_description`, `custom_image_url`
    - `position` (default 0), `is_active` (default true)
    - `created_at`, `updated_at`

### Admin Tables

22. **admin_audit_log** - Tracks admin actions for audit trail
    - `id`, `admin_id` (references users)
    - `action` (TEXT, e.g., 'approve_seller', 'suspend_user', 'process_refund')
    - `target_user_id` (optional, references users)
    - `target_entity_type` (TEXT, e.g., 'product', 'order', 'seller', 'user')
    - `target_entity_id` (UUID)
    - `metadata` (JSONB for additional context)
    - `created_at`
    - **Viewable at**: `/admin/audit-log` with filters by action, entity type, and date range

23. **platform_settings** - Platform-wide configuration
    - `id`, `key` (unique TEXT)
    - `value` (JSONB)
    - `updated_by` (references users)
    - `updated_at`

## Key Architecture Patterns

### 1. Server Actions Pattern

All database mutations use Next.js Server Actions with `'use server'` directive.

```typescript
// src/actions/products.ts
'use server'

export async function createProduct(input: ProductInput, images?: string[]) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Seller profile check
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (profile?.status !== 'approved') {
    return { error: 'Your seller account is not approved yet' }
  }

  // Create product, variant, inventory, images...
  // Return { product } or { error }
}
```

### 2. TypeScript Workaround for Supabase

Supabase client sometimes infers `never` for complex queries. Use type casting:

```typescript
// Cast supabase to any for insert/update operations
const { data, error } = await (supabase as any)
  .from('products')
  .insert({ ... })
  .select()
  .single()

// Cast result to expected type
const product = data as Product
```

### 3. Soft Delete Pattern

Products use soft delete (status: 'deleted') instead of hard delete:

```typescript
// Filter out deleted products in queries
.neq('status', 'deleted')

// Soft delete
.update({ status: 'deleted' })
```

### 4. Multi-Vendor Order Flow

1. Customer places order with items from multiple sellers
2. Order is created with overall status
3. Order items are grouped by seller_id
4. Each seller manages their own order items independently
5. When all items have same status, main order status updates

### 5. Zustand Cart Store

```typescript
// src/stores/cart-store.ts
interface CartStore {
  items: CartItem[]
  addItem: (product, variant, quantity) => void
  removeItem: (variantId) => void
  updateQuantity: (variantId, quantity) => void
  clearCart: () => void
  total: number
}

// Persisted to localStorage
```

## Key Features by User Role

### Customer
- Browse products with filters/search
- Add to cart/wishlist
- Checkout with Stripe or QPay (test)
- Track orders
- Leave reviews
- Manage multiple addresses at `/account/addresses`
- View seller stores at `/sellers/[slug]`

### Seller
- Register and await approval
- Dashboard with stats (revenue, sales, orders, products)
- Product CRUD with images, variants, inventory
- Order fulfillment (processing → shipped → delivered)
- View analytics at `/seller/analytics`
- Upload store logo at `/seller/settings`
- Public store page at `/sellers/[slug]`

### Admin
- Super Admin Dashboard at `/admin`
- Approve/suspend sellers (with interactive buttons)
- Manage categories
- Platform-wide analytics
- User management with impersonation
- Order management with Stripe refund processing
- Hero banners and featured categories management
- System maintenance actions at `/admin/maintenance`
- Admin audit log at `/admin/audit-log` with filtering and pagination

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=

# Cron (required for Vercel cron jobs)
CRON_SECRET=
```

## File Upload

Product images upload to Supabase Storage:

```typescript
const supabase = createClient()
const filePath = `product-images/${fileName}`

await supabase.storage
  .from('products')
  .upload(filePath, file)

const { data: { publicUrl } } = supabase.storage
  .from('products')
  .getPublicUrl(filePath)
```

**Required**: Create a storage bucket named `products` in Supabase dashboard.

## Routing Structure

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Home page | Public |
| `/products` | Product listing | Public |
| `/products/[slug]` | Product detail | Public |
| `/cart` | Shopping cart | Public |
| `/checkout` | Checkout flow | Protected |
| `/checkout/qpay` | QPay test payment | Protected |
| `/checkout/success` | Order success page | Protected |
| `/login`, `/signup` | Auth pages | Guest only |
| `/account/*` | User dashboard | Protected |
| `/seller` | Seller dashboard | Seller only |
| `/seller/products` | Product management | Seller only |
| `/seller/orders` | Order management | Seller only |
| `/seller/register` | Seller registration | Protected |
| `/admin` | Admin dashboard | Admin only |
| `/admin/users` | User management | Admin only |
| `/admin/sellers` | Seller management | Admin only |
| `/admin/products` | Product moderation | Admin only |
| `/admin/orders` | Order management | Admin only |
| `/admin/analytics` | Platform analytics | Admin only |
| `/admin/maintenance` | System maintenance | Admin only |
| `/admin/audit-log` | Admin audit log | Admin only |
| `/admin/settings` | Platform settings | Admin only |
| `/account/addresses` | Address management | Protected |
| `/sellers/[slug]` | Seller store page | Public |

## Commission Structure

- Platform fee: 10% default (configurable per seller)
- Seller receives: total - platform_fee
- Stored in `order_items.seller_amount` and `order_items.commission_amount`

---

## Pricing Utilities

Centralized pricing calculations are in `/src/lib/pricing.ts` to ensure consistency across checkout APIs, webhooks, and payment processing.

### Constants

```typescript
TAX_RATE = 0.10                    // 10% tax
FREE_SHIPPING_THRESHOLD = 50       // Free shipping for orders over $50
DEFAULT_SHIPPING_COST = 4.99       // Default shipping cost
DEFAULT_COMMISSION_RATE = 10       // 10% platform commission
```

### Functions

```typescript
// Calculate tax amount
calculateTax(subtotal: number): number

// Calculate shipping (free over threshold)
calculateShipping(subtotal: number): number

// Calculate commission for seller
calculateCommission(total: number, commissionRate: number): number

// Calculate seller amount after commission
calculateSellerAmount(total: number, commissionRate: number): number

// Calculate all order totals
calculateOrderTotals(subtotal: number): { subtotal, shipping, tax, grandTotal }

// Calculate order item totals with commission
calculateOrderItemTotals(unitPrice: number, quantity: number, commissionRate?: number): {
  subtotal, taxAmount, total, commissionRate, commissionAmount, sellerAmount
}

// Validation helpers
isValidPrice(price: unknown): boolean
isValidQuantity(quantity: unknown): boolean
```

### Usage

All checkout APIs and webhooks use these utilities:
- `/src/app/api/checkout/route.ts` - Stripe checkout
- `/src/app/api/test-payment/route.ts` - QPay test payment
- `/src/app/api/webhooks/stripe/route.ts` - Stripe webhook

---

## Error Handling Utilities

Standardized error handling is available in `/src/lib/errors.ts` for consistent server action responses.

### Error Codes

```typescript
import { ErrorCode } from '@/lib/errors'

// Available codes
ErrorCode.NOT_AUTHENTICATED    // User not logged in
ErrorCode.NOT_AUTHORIZED       // User lacks permission
ErrorCode.VALIDATION_ERROR     // Input validation failed
ErrorCode.NOT_FOUND           // Resource not found
ErrorCode.INSUFFICIENT_INVENTORY
ErrorCode.STRIPE_ERROR
ErrorCode.DATABASE_ERROR
// ... and more
```

### ActionResult Type

```typescript
import { ActionResult, success, error } from '@/lib/errors'

// Server action with typed response
async function myAction(): Promise<ActionResult<MyData>> {
  // Return success
  return success({ id: '123', name: 'Test' })

  // Return error
  return error(ErrorCode.NOT_FOUND, 'Олдсонгүй')
}

// Helper functions
authError()       // Authentication error
forbiddenError()  // Authorization error
notFoundError()   // Not found error
validationError() // Validation error
dbError()         // Database error
```

### Legacy Compatibility

For gradual migration from old `{ error?: string }` pattern:

```typescript
import { fromLegacy, toLegacy } from '@/lib/errors'

// Convert legacy to ActionResult
const result = fromLegacy(oldResult, 'data')

// Convert ActionResult to legacy
const legacy = toLegacy(newResult, 'data')
```

---

## Address Management

Customer address management is available at `/account/addresses` with full CRUD operations.

### Server Actions

Located in `/src/actions/addresses.ts`:

```typescript
getUserAddresses()                    // Get all user addresses
createAddress(data)                   // Create new address
updateAddress(id, data)              // Update existing address
deleteAddress(id)                    // Delete address
setDefaultAddress(id, type)          // Set default shipping/billing
```

### Features

- Multiple addresses per user
- Set default shipping address
- Mongolian district/province dropdown
- Form validation with Zod
- Real-time updates with optimistic UI

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
```

## Database Seeding

Categories are seeded via SQL in Supabase:
- See `supabase/seed.sql` for category structure
- Run in Supabase SQL Editor after creating tables

## Database Triggers & Functions

### Auto-Created Triggers

1. **`update_updated_at_column()`** - Auto-updates `updated_at` on all tables
2. **`handle_new_user()`** - Creates public.users record when auth.users is created
   - Also creates default wishlist for new users
3. **`set_order_number()`** - Auto-generates order_number on insert
   - Format: `ORD-YYYYMMDD-XXXXXX` (6 random hex chars)
4. **`update_product_rating()`** - Updates product rating_average/rating_count when reviews change

### Helper Functions

```sql
public.get_user_role()           -- Returns current user's role
public.is_admin()                -- Returns true if current user is admin
public.is_seller()               -- Returns true if current user is approved seller
public.get_seller_profile_id()   -- Returns current user's seller profile ID
public.increment_product_views(product_id) -- Increment view count
public.increment_banner_clicks(banner_id)  -- Increment banner click count
```

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Users**: Can only view/update own profile
- **Sellers**: Can manage own products, variants, inventory, images
- **Products**: Public can only view `status = 'active'`
- **Orders**: Users see own orders; Sellers see order_items for their products
- **Categories**: Public can view `is_active = TRUE`; Admins can manage
- **Hero Banners**: Public can view `is_active = TRUE`; Admins can manage all
- **Featured Categories**: Public can view `is_active = TRUE`; Admins can manage all
- **Admin Audit Log**: Only admins can view/insert
- **Platform Settings**: Public can view; Only admins can update
- **Notifications**: Users can only view/manage own notifications

## Security Measures

### Price Validation
All checkout APIs validate product prices from the database rather than trusting client-provided prices. This prevents price manipulation attacks.

**Implementation**:
- Checkout APIs fetch actual prices from `product_variants` table
- Client-provided prices are ignored
- Inventory availability is checked before order creation
- Invalid quantities (negative, zero, non-integer) are rejected

### Inventory Validation
Before processing orders, the system checks:
1. Product exists and is `active` status
2. Variant exists for the product
3. Sufficient inventory quantity (unless `allow_backorder` is true)

### JSON Parsing
Stripe webhook metadata is parsed with error handling using `safeJsonParse()` to prevent crashes from malformed data.

---

## Important Notes

1. **Seller Approval**: New sellers have `status: 'pending'`. Admin must set to `approved` before they can add products.

2. **Product Variants**: Every product has at least one default variant. Inventory is tracked per variant.

3. **Image Upload**: Requires Supabase Storage bucket named `products`. Images stored as public URLs.

4. **Order Status Flow**:
   - `pending` → `confirmed` → `processing` → `shipped` → `out_for_delivery` → `delivered`
   - Can be `cancelled`, `refunded`, or `returned` from appropriate states

5. **Order Number**: Auto-generated via trigger, format `ORD-20240115-A3F2C1`

6. **User Creation**: When a user signs up via Supabase Auth, a trigger automatically:
   - Creates a record in `public.users`
   - Creates a default wishlist

7. **TypeScript Caveats**: Due to Supabase type inference issues with complex queries, some operations use `(supabase as any)` casting. This is intentional.

8. **Commission Calculation**:
   - Default: 10% platform fee
   - `order_items.seller_amount = total - commission_amount`
   - Commission rate stored per seller and per order_item

9. **Sales Count Tracking**:
   - `products.sales_count` is incremented on payment confirmation
   - Updated in both QPay test payment and Stripe webhook
   - Nightly reconciliation ensures data integrity
   - Manual reconciliation available at `/admin/maintenance`

10. **Vercel Cron Jobs**:
    - Configured in `vercel.json`
    - `/api/cron/nightly` runs all nightly maintenance jobs
    - Requires `CRON_SECRET` environment variable
    - Schedule: 18:00 UTC (02:00 Mongolia time)

## Seed Data

Categories are pre-seeded with 8 main categories and subcategories:
- Electronics (Smartphones, Laptops, Audio, Cameras, Gaming)
- Clothing (Men's, Women's, Kids', Shoes, Accessories)
- Home & Garden (Furniture, Kitchen, Bedding, Garden)
- Sports & Outdoors
- Books
- Beauty & Health
- Toys & Games
- Automotive
