# Manual Testing Guide

This document provides step-by-step instructions for manually testing the features implemented in the e-commerce application.

---

## Table of Contents

1. [Address Management](#1-address-management)
2. [Seller Approval Workflow](#2-seller-approval-workflow)
3. [Seller Logo Upload](#3-seller-logo-upload)
4. [Order Cancellation Side Effects](#4-order-cancellation-side-effects)
5. [Admin Refund Processing](#5-admin-refund-processing)
6. [Performance Verification](#6-performance-verification-n1-query-fixes)
7. [Quick Checklist](#quick-checklist)

---

## 1. Address Management

**Path:** `/account/addresses`

**Prerequisites:** Log in as a regular customer

### Test Steps

#### 1.1 Add New Address

1. Navigate to **Account → Addresses** (`/account/addresses`)
2. Click "Хаяг нэмэх" (Add Address)
3. Fill in the form:
   - Хаягийн нэр (optional): "Гэр"
   - Хүлээн авагчийн нэр: "Test User"
   - Утас: "99001122"
   - Гудамжны хаяг: "Test Street 123"
   - Хот: "Улаанбаатар"
   - Дүүрэг/Аймаг: Select from dropdown (e.g., "Баянзүрх")
   - Шуудангийн код: "13000"
4. Click "Хаяг нэмэх"

**Expected Results:**
- [ ] Toast shows success message
- [ ] New address appears in list

#### 1.2 Edit Address

1. Click "Засах" on an existing address
2. Modify any field
3. Click "Хадгалах"

**Expected Results:**
- [ ] Changes are saved and displayed

#### 1.3 Set Default Address

1. Click "Үндсэн болгох" on a non-default address

**Expected Results:**
- [ ] The "Үндсэн" badge moves to the selected address

#### 1.4 Delete Address

1. Click "Устгах" on a non-default address
2. Confirm deletion in the dialog

**Expected Results:**
- [ ] Address is removed from the list

---

## 2. Seller Approval Workflow

**Path:** `/admin`

**Prerequisites:** Log in as an admin user, have at least one pending seller

### Test Steps

#### 2.1 Approve a Seller

1. Navigate to **Admin Dashboard** (`/admin`)
2. Find the "Хүлээгдэж буй худалдагчид" (Pending Sellers) section
3. Click "Батлах" (Approve) on a pending seller card

**Expected Results:**
- [ ] Loading spinner appears during processing
- [ ] Toast shows success message
- [ ] Seller card disappears from pending section

#### 2.2 Reject a Seller

1. Click "Татгалзах" (Reject) on another pending seller

**Expected Results:**
- [ ] Loading spinner appears
- [ ] Toast shows success message
- [ ] Seller card disappears

#### 2.3 Verify in Database

Check `seller_profiles` table in Supabase:

```sql
SELECT id, store_name, status FROM seller_profiles ORDER BY updated_at DESC;
```

**Expected Results:**
- [ ] Approved seller has `status = 'approved'`
- [ ] Rejected seller has `status = 'rejected'`

---

## 3. Seller Logo Upload

**Path:** `/seller/settings`

**Prerequisites:** Log in as an approved seller

### Test Steps

#### 3.1 Upload Logo

1. Navigate to **Seller Dashboard → Settings** (`/seller/settings`)
2. Find the store logo section (circular image area)
3. Click the orange upload button (bottom-right of the circle)
4. Select an image file (JPG, PNG, or GIF under 2MB)

**Expected Results:**
- [ ] Loading spinner appears on the button
- [ ] Toast shows "Лого амжилттай шинэчлэгдлээ!"
- [ ] New logo appears in the circle

#### 3.2 Test Validation - Wrong File Type

1. Try to upload a non-image file (e.g., .pdf, .txt)

**Expected Results:**
- [ ] Error toast: "Зөвхөн зураг оруулна уу"

#### 3.3 Test Validation - File Too Large

1. Try to upload an image larger than 2MB

**Expected Results:**
- [ ] Error toast: "Зураг 2MB-ээс бага байх ёстой"

#### 3.4 Verify in Database

Check `seller_profiles` table:

```sql
SELECT id, store_name, store_logo_url FROM seller_profiles WHERE user_id = 'YOUR_USER_ID';
```

**Expected Results:**
- [ ] `store_logo_url` contains Supabase storage URL

---

## 4. Order Cancellation Side Effects

**Prerequisites:** Have an order with status that can be cancelled

### Test Steps

1. As a seller, go to **Seller Dashboard → Orders** (`/seller/orders`)
2. Find an order item and change its status to "Cancelled"

### Verify in Database

Run the following queries before and after cancellation:

```sql
-- Check inventory
SELECT pv.id, p.name, i.quantity
FROM inventory i
JOIN product_variants pv ON i.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE pv.id = 'VARIANT_ID';

-- Check product sales_count
SELECT id, name, sales_count FROM products WHERE id = 'PRODUCT_ID';

-- Check seller stats
SELECT id, store_name, total_sales, total_revenue FROM seller_profiles WHERE id = 'SELLER_ID';
```

**Expected Results:**
- [ ] `inventory.quantity` is restored (increased by order quantity)
- [ ] `products.sales_count` is decremented
- [ ] `seller_profiles.total_sales` is decremented
- [ ] `seller_profiles.total_revenue` is reduced by seller_amount

---

## 5. Admin Refund Processing

**Path:** `/admin/orders`

**Prerequisites:** Log in as admin, have an order with `payment_status = 'succeeded'` or `'paid'`

### Test Steps

#### 5.1 Process a Refund

1. Navigate to **Admin → Orders** (`/admin/orders`)
2. Find an order with "Төлөгдсөн" (Paid) payment status
3. Click the actions menu (three dots) on the order row
4. Select "Буцаалт хийх" (Process Refund)
5. Confirm the refund in the dialog

**Expected Results:**
- [ ] Loading spinner appears during processing
- [ ] Toast shows "Буцаалт амжилттай боловсруулагдлаа"
- [ ] If Stripe payment, toast shows Stripe refund ID
- [ ] Order status changes to "Буцаагдсан" (Refunded)
- [ ] Payment status changes to "Буцаагдсан" (Refunded)

#### 5.2 Verify Side Effects

Check in database:

```sql
-- Check order status
SELECT id, order_number, status, payment_status FROM orders WHERE id = 'ORDER_ID';

-- Check order items status
SELECT id, status, product_id, quantity FROM order_items WHERE order_id = 'ORDER_ID';

-- Check inventory was restored
SELECT i.quantity, pv.id as variant_id
FROM inventory i
JOIN product_variants pv ON i.variant_id = pv.id
JOIN order_items oi ON oi.variant_id = pv.id
WHERE oi.order_id = 'ORDER_ID';

-- Check product sales_count was decremented
SELECT id, name, sales_count FROM products WHERE id IN (
  SELECT product_id FROM order_items WHERE order_id = 'ORDER_ID'
);

-- Check seller stats were updated
SELECT id, store_name, total_sales, total_revenue FROM seller_profiles WHERE id IN (
  SELECT seller_id FROM order_items WHERE order_id = 'ORDER_ID'
);

-- Check admin audit log
SELECT * FROM admin_audit_log WHERE target_entity_id = 'ORDER_ID' ORDER BY created_at DESC;
```

**Expected Results:**
- [ ] Order status = 'refunded'
- [ ] Order items status = 'refunded'
- [ ] Inventory quantities restored
- [ ] Product sales_count decremented
- [ ] Seller total_sales and total_revenue decremented
- [ ] Audit log entry with action = 'process_refund'

#### 5.3 Test Validation - Already Refunded

1. Try to refund an order that's already refunded

**Expected Results:**
- [ ] Error toast: "Энэ захиалга аль хэдийн буцаагдсан байна"

#### 5.4 Test Validation - Unpaid Order

1. Try to refund an order with `payment_status` = 'pending'

**Expected Results:**
- [ ] Error toast: "Зөвхөн төлбөр төлөгдсөн захиалгыг буцаах боломжтой"

---

## 6. Performance Verification (N+1 Query Fixes)

### Test Steps

#### 6.1 Seller Analytics

1. Open browser DevTools → Network tab
2. Navigate to `/seller/analytics`
3. Filter by "Fetch/XHR" requests

**Expected Results:**
- [ ] No excessive/repeated database calls
- [ ] Page loads quickly

#### 6.2 Admin Orders

1. Navigate to `/admin/orders`
2. Check the status filter tabs

**Expected Results:**
- [ ] Status counts load in a single request
- [ ] Page loads without visible delay

#### 6.3 Seller Orders

1. Navigate to `/seller/orders`
2. Check the status filter tabs

**Expected Results:**
- [ ] Counts load quickly
- [ ] No multiple sequential requests for each status

---

## Quick Checklist

| Feature | Path | Pass/Fail |
|---------|------|-----------|
| Add address | `/account/addresses` | ☐ |
| Edit address | `/account/addresses` | ☐ |
| Delete address | `/account/addresses` | ☐ |
| Set default address | `/account/addresses` | ☐ |
| Approve seller | `/admin` | ☐ |
| Reject seller | `/admin` | ☐ |
| Upload seller logo | `/seller/settings` | ☐ |
| Logo validation (type) | `/seller/settings` | ☐ |
| Logo validation (size) | `/seller/settings` | ☐ |
| Order cancellation restores inventory | `/seller/orders` | ☐ |
| **Refund processing** | `/admin/orders` | ☐ |
| **Refund restores inventory** | `/admin/orders` | ☐ |
| **Refund updates seller stats** | `/admin/orders` | ☐ |
| **Refund validation (already refunded)** | `/admin/orders` | ☐ |
| **Refund validation (unpaid order)** | `/admin/orders` | ☐ |
| Analytics page performance | `/seller/analytics` | ☐ |
| Order status counts performance | `/admin/orders` | ☐ |

---

## Notes

- All tests should be performed on a development or staging environment
- Database queries can be run in Supabase SQL Editor
- Browser DevTools Network tab is useful for performance verification
- Toast messages are in Mongolian (Cyrillic script)
