# Manual Testing Guide

This document provides step-by-step instructions for manually testing the features implemented in the e-commerce application.

---

## Table of Contents

1. [Address Management](#1-address-management)
2. [Seller Approval Workflow](#2-seller-approval-workflow)
3. [Seller Logo Upload](#3-seller-logo-upload)
4. [Order Cancellation Side Effects](#4-order-cancellation-side-effects)
5. [Admin Refund Processing](#5-admin-refund-processing)
6. [Admin Audit Log](#6-admin-audit-log)
7. [Performance Verification](#7-performance-verification-n1-query-fixes)
8. [Notification System](#8-notification-system)
9. [Quick Checklist](#quick-checklist)

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

## 6. Admin Audit Log

**Path:** `/admin/audit-log`

**Prerequisites:** Log in as an admin user

### Test Steps

#### 6.1 View Audit Log Stats

1. Navigate to **Admin → Үйлдлийн лог** (`/admin/audit-log`)
2. Observe the stats cards at the top

**Expected Results:**
- [ ] "Нийт лог" card shows total audit log count
- [ ] "Өнөөдрийн лог" card shows today's log count
- [ ] "Админуудын тоо" card shows unique admin count
- [ ] "Түгээмэл үйлдлүүд" card shows top 3 actions

#### 6.2 Filter by Action Type

1. Click the "Үйлдэл сонгох" dropdown
2. Select "Худалдагч баталгаажуулсан" (approve_seller)

**Expected Results:**
- [ ] Table shows only seller approval logs
- [ ] Page resets to 1

#### 6.3 Filter by Entity Type

1. Click the "Төрөл сонгох" dropdown
2. Select "Захиалга" (order)

**Expected Results:**
- [ ] Table shows only order-related logs

#### 6.4 Filter by Date Range

1. Set "From" date to a week ago
2. Set "To" date to today

**Expected Results:**
- [ ] Table shows only logs within the date range

#### 6.5 Test Pagination

1. Clear filters to show all logs
2. If more than 20 logs exist, click "Дараах" (Next)

**Expected Results:**
- [ ] Page number updates
- [ ] Table shows next set of logs
- [ ] "Өмнөх" (Previous) button becomes active

#### 6.6 Verify Log Entry Details

1. Look at any log entry in the table

**Expected Results:**
- [ ] Shows relative time (e.g., "5 минутын өмнө")
- [ ] Shows exact date/time below
- [ ] Shows action badge with icon
- [ ] Shows admin name and email
- [ ] Shows target entity type and details
- [ ] Shows metadata if available

#### 6.7 Refresh Logs

1. Click "Шинэчлэх" (Refresh) button

**Expected Results:**
- [ ] Toast shows "Лог шинэчлэгдлээ"
- [ ] Stats and logs are refreshed

---

## 7. Performance Verification (N+1 Query Fixes)

### Test Steps

#### 7.1 Seller Analytics

1. Open browser DevTools → Network tab
2. Navigate to `/seller/analytics`
3. Filter by "Fetch/XHR" requests

**Expected Results:**
- [ ] No excessive/repeated database calls
- [ ] Page loads quickly

#### 7.2 Admin Orders

1. Navigate to `/admin/orders`
2. Check the status filter tabs

**Expected Results:**
- [ ] Status counts load in a single request
- [ ] Page loads without visible delay

#### 7.3 Seller Orders

1. Navigate to `/seller/orders`
2. Check the status filter tabs

**Expected Results:**
- [ ] Counts load quickly
- [ ] No multiple sequential requests for each status

---

## 8. Notification System

**Prerequisites:** Have accounts ready as customer, seller (pending), and admin

### Test Steps

#### 8.1 Order Payment Notification (Customer)

1. Log in as a customer
2. Add products to cart and complete checkout using QPay test payment
3. Click the notification bell icon in the header

**Expected Results:**
- [ ] Notification bell shows unread count badge (red circle with "1")
- [ ] Clicking bell shows notification: "Захиалга баталгаажлаа"
- [ ] Notification shows the order number
- [ ] Clicking mark as read updates the count

#### 8.2 Order Status Change Notification (Customer)

1. Log in as seller
2. Navigate to `/seller/orders`
3. Change an order item status to "Shipped"
4. Log in as the customer who placed that order
5. Click the notification bell

**Expected Results:**
- [ ] Notification: "Захиалга илгээгдлээ" with product name
- [ ] Shows tracking number if provided
- [ ] Unread count updates accordingly

#### 8.3 Seller Approval Notification

1. Log in as a new user
2. Register as seller at `/seller/register`
3. Log in as admin
4. Navigate to `/admin` or `/admin/sellers`
5. Approve the pending seller
6. Log in as the newly approved seller
7. Click the notification bell

**Expected Results:**
- [ ] Notification: "Худалдагчаар бүртгэгдлээ!"
- [ ] Message indicates they can now add products

#### 8.4 Seller Rejection Notification

1. Create another pending seller account
2. Log in as admin and reject the seller
3. Log in as the rejected seller
4. Check notifications

**Expected Results:**
- [ ] Notification: "Хүсэлт татгалзагдлаа"
- [ ] Message indicates to contact support

#### 8.5 Mark All as Read

1. Ensure there are multiple unread notifications
2. Click the notification bell
3. Click "Бүгдийг уншсан" (Mark all as read)

**Expected Results:**
- [ ] All notifications marked as read
- [ ] Unread count badge disappears
- [ ] Notifications no longer highlighted

#### 8.6 Auto-Refresh

1. Open the app in two browser tabs
2. In tab 1, trigger an action that creates a notification (e.g., approve seller)
3. Wait 30 seconds in tab 2

**Expected Results:**
- [ ] Tab 2 updates unread count automatically (polling every 30 seconds)

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
| **Audit log stats display** | `/admin/audit-log` | ☐ |
| **Audit log filtering** | `/admin/audit-log` | ☐ |
| **Audit log pagination** | `/admin/audit-log` | ☐ |
| **Order payment notification** | notification bell | ☐ |
| **Order status notification** | notification bell | ☐ |
| **Seller approval notification** | notification bell | ☐ |
| **Mark all as read** | notification bell | ☐ |
| Analytics page performance | `/seller/analytics` | ☐ |
| Order status counts performance | `/admin/orders` | ☐ |

---

## Notes

- All tests should be performed on a development or staging environment
- Database queries can be run in Supabase SQL Editor
- Browser DevTools Network tab is useful for performance verification
- Toast messages are in Mongolian (Cyrillic script)
