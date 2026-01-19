# E-Commerce Application Improvement Plan

## Overview

This document outlines the security fixes, code improvements, and feature enhancements identified in the codebase analysis.

---

## Phase 1: Security & Data Integrity Fixes (Current Sprint)

### TODO Items (COMPLETED)

- [x] **1.1 Price Validation Security** - Fix checkout APIs to validate prices from database
  - Files: `src/app/api/checkout/route.ts`, `src/app/api/test-payment/route.ts`
  - Issue: APIs trusted client-provided prices instead of validating from database
  - **Status: DONE** - Now fetches prices from database, validates inventory, rejects invalid quantities

- [x] **1.2 Commission Rate Consistency** - Fix Stripe webhook to use seller's configured rate
  - File: `src/app/api/webhooks/stripe/route.ts`
  - Issue: Hardcoded 10% commission instead of seller's `commission_rate`
  - **Status: DONE** - Now fetches seller's commission_rate from seller_profiles table

- [x] **1.3 Inventory Field Mismatch** - Fix webhook to update correct inventory table
  - File: `src/app/api/webhooks/stripe/route.ts`
  - Issue: Updates non-existent `stock` field instead of `inventory.quantity`
  - **Status: DONE** - Now queries and updates `inventory` table correctly

- [x] **1.4 Extract Shared Pricing Logic** - Create centralized pricing utilities
  - New file: `src/lib/pricing.ts`
  - Issue: Tax, shipping, commission calculations duplicated across files
  - **Status: DONE** - Created pricing.ts with all calculation functions and constants

- [x] **1.5 JSON Parsing Error Handling** - Add try-catch for metadata parsing
  - File: `src/app/api/webhooks/stripe/route.ts`
  - Issue: No error handling if JSON.parse fails on metadata
  - **Status: DONE** - Added safeJsonParse() helper function

---

## Phase 2: Feature Completion (Current Sprint)

### TODO Items (COMPLETED)

- [x] **2.1 Order Cancellation & Refunds**
  - File: `src/actions/orders.ts`
  - Implement: Cancel order, decrement sales_count, restore inventory, decrement seller stats
  - **Status: DONE** - Added `handleOrderItemCancellation()` helper function in `updateOrderStatus()`

- [ ] **2.2 Notification System**
  - Files: `src/actions/notifications.ts` (new)
  - Implement: Robust notification service with error handling

- [x] **2.3 Address Management**
  - Files: `src/app/(main)/account/addresses/page.tsx`, `src/actions/addresses.ts` (new)
  - Implement: CRUD operations for user addresses
  - **Status: DONE** - Created full CRUD server actions and connected UI to database

- [ ] **2.4 Promo Code System**
  - Files: `src/actions/coupons.ts` (new), cart page
  - Implement: Coupon validation and application

- [x] **2.5 Seller Store Pages**
  - Files: `src/app/(main)/sellers/[slug]/page.tsx`
  - **Status: DONE** - Already fully implemented with:
    - Store banner and logo display
    - Store info (name, rating, sales count, join date)
    - Product grid with pagination
    - Sort options (newest, price ascending/descending)

---

## Phase 3: Code Quality (Current Sprint)

### TODO Items (COMPLETED)

- [x] **3.1 Standardize Error Handling**
  - Create `src/lib/errors.ts` with standard error types
  - **Status: DONE** - Created comprehensive error handling utilities:
    - Error codes enum with Mongolian messages
    - `ActionResult<T>` type for consistent server action responses
    - Helper functions: `success()`, `error()`, `authError()`, `validationError()`, etc.
    - Legacy compatibility functions for gradual migration

- [x] **3.2 Fix N+1 Query Problems**
  - Files: `src/actions/analytics.ts`, `src/actions/orders.ts`, `src/actions/admin.ts`
  - **Status: DONE** - Replaced loop-based queries with single aggregated queries:
    - `analytics.ts`: Product revenue now fetched in one query and aggregated in JS
    - `orders.ts`: `getOrderStatusCounts()` now uses single query with JS aggregation
    - `admin.ts`: `getOrderStatusCounts()` now uses single query with JS aggregation

- [ ] **3.3 Remove TypeScript `any` casts**
  - Multiple files using `(supabase as any)`
  - Fix Supabase type generation

---

## Phase 4: Admin Features (Current Sprint)

### TODO Items (COMPLETED)

- [x] **4.1 Fix Seller Approval Workflow**
  - File: `src/app/admin/page.tsx`
  - **Status: DONE** - Created client components for seller approval:
    - `src/components/admin/PendingSellerCard.tsx` - Card with approve/reject handlers
    - `src/components/admin/PendingSellersSection.tsx` - Wrapper component
    - Updated admin page to use new components

- [x] **4.2 Implement Refund Processing**
  - Files: `src/actions/admin.ts`, `src/app/admin/orders/page.tsx`
  - **Status: DONE** - Implemented full refund processing:
    - Added `processOrderRefund()` server action with Stripe integration
    - Creates Stripe refund via payment_intent
    - Updates order/payment status to 'refunded'
    - Restores inventory for all order items
    - Decrements product `sales_count` and seller stats
    - Logs action to admin audit log
    - Updated admin orders page to use new refund action

- [ ] **4.3 Admin Audit Log UI**
  - New file: `src/app/admin/audit-log/page.tsx`
  - Display admin actions with filters

---

## Phase 5: Seller Settings (Current Sprint)

### TODO Items (COMPLETED)

- [x] **5.1 Logo Upload Functionality**
  - File: `src/app/seller/settings/page.tsx`
  - **Status: DONE** - Implemented file upload to Supabase storage:
    - Added `handleLogoUpload()` function with file validation (type, size)
    - Uploads to `products` bucket under `seller-logos/` path
    - Updates seller profile with new logo URL
    - Shows loading state during upload

- [ ] **5.2 Notification Preferences Persistence**
  - Save notification toggles to database

- [ ] **5.3 Security Features**
  - Implement password change and 2FA setup

---

## Phase 6: Accessibility (Future Sprint)

### TODO Items

- [ ] **6.1 Add ARIA Labels** to interactive elements
- [ ] **6.2 Improve Keyboard Navigation**
- [ ] **6.3 Fix Mobile Touch Targets** (minimum 44x44px)

---

## Phase 7: Testing (Future Sprint)

### TODO Items

- [ ] **7.1 Setup Vitest + Testing Library**
- [ ] **7.2 Add tests for server actions**
- [ ] **7.3 Add tests for Zustand stores**
- [ ] **7.4 Add tests for API routes**

---

## Issues Identified

### Critical (Security/Data Loss)
1. Client-provided prices not validated in checkout APIs
2. Commission rate inconsistency between payment methods
3. Inventory field mismatch in webhook
4. JSON parsing without error handling

### High Priority
1. Extensive TypeScript `any` casts
2. N+1 query problems in analytics
3. Duplicate business logic across files
4. Missing input validation

### Medium Priority
1. Incomplete features (notifications, refunds, coupons)
2. Inconsistent error handling patterns
3. Race conditions in inventory updates

### Low Priority
1. Placeholder images and data
2. Console.log statements in production
3. Missing rate limiting
