# Out of Stock Feature Implementation

## Overview
Implemented comprehensive out-of-stock functionality to prevent users from adding unavailable products to cart and processing orders with out-of-stock items.

## Changes Made

### 1. Backend Changes

#### Product Model (`server/models/Product.ts`)
- Added `outOfStock` boolean field to the Product schema (default: false)
- Added pre-save middleware to automatically set `outOfStock = true` when `stockQuantity <= 0`
- Added pre-update middleware for `findOneAndUpdate` to handle automatic out-of-stock updates

#### Product Routes (`server/routes/products.ts`)
- Updated POST route to accept and save `outOfStock` field
- Updated PUT route to accept and update `outOfStock` field

### 2. Frontend Changes

#### Types (`types.ts`)
- Added `outOfStock?: boolean` field to Product interface

#### Product Form (`components/admin/ProductForm.tsx`)
- Added `outOfStock` checkbox in the admin product form
- Checkbox allows manual marking of products as out of stock
- Included `outOfStock` in form state and submission data
- Added clear label: "Mark as 'Out of Stock' (prevents adding to cart)"

#### App Context (`context/AppContext.tsx`)
- Updated `mapProductData` helper to include `outOfStock` field
- Updated `addProduct` function to send and map `outOfStock`
- Updated `updateProduct` function to send and map `outOfStock`
- **Enhanced `addToCart` function** with out-of-stock validation:
  - Checks both `outOfStock` flag and `stockQuantity <= 0`
  - Shows error toast if product is unavailable
  - Prevents adding out-of-stock products to cart

#### Product Detail (`components/ProductDetail.tsx`)
- Updated product fetch mapping to include `outOfStock`
- Updated refresh handler mapping to include `outOfStock`
- Modified "Add to Cart" button to be disabled when `outOfStock || stockQuantity <= 0`
- Updated button text to show "Out of Stock" for unavailable products
- Updated stock availability message to consider `outOfStock` flag

#### Cart (`components/Cart.tsx`)
- Added visual indicators for out-of-stock items:
  - Red background highlight for out-of-stock items
  - "OUT OF STOCK" badge in red
  - Warning message: "This item cannot be ordered. Please remove it from cart."
- Disabled quantity input for out-of-stock items
- Changed currency symbol from $ to ₹ for consistency

#### Checkout (`components/Checkout.tsx`)
- Added validation in `handleSubmit` to check for out-of-stock items before order placement
- Added validation in `handleRazorpayPayment` to check for out-of-stock items before payment
- Shows detailed error message listing all out-of-stock items
- Prevents order/payment processing if any cart item is out of stock

## Features

### Automatic Out-of-Stock
- Products are automatically marked as out of stock when `stockQuantity` reaches 0
- Happens on both product creation and updates
- Ensures data consistency

### Manual Out-of-Stock
- Admins can manually mark products as out of stock via checkbox
- Useful for temporarily disabling products even when stock is available
- Example use cases:
  - Product quality issues
  - Supplier problems
  - Seasonal unavailability
  - Pending restocking

### User Protection
1. **Add to Cart Prevention**: Users cannot add out-of-stock products to cart
2. **Visual Indicators**: Clear "OUT OF STOCK" badges and messages in cart
3. **Checkout Validation**: Orders cannot be placed with out-of-stock items
4. **Payment Prevention**: Razorpay payments blocked for carts with out-of-stock items

### Admin Control
- Full visibility of stock status in product management
- Easy toggle to mark/unmark products as out of stock
- Stock quantity field still visible and editable

## Testing Checklist

- [ ] Create a product with stock quantity = 0 → Should auto-mark as out of stock
- [ ] Try to add out-of-stock product to cart → Should show error
- [ ] Manually check "Out of Stock" checkbox → Product should be unavailable
- [ ] Add product to cart, then mark it out of stock → Should show warning in cart
- [ ] Try to checkout with out-of-stock item → Should show error
- [ ] Try Razorpay payment with out-of-stock item → Should show error
- [ ] Update product stock from 0 to 5 → Should remain out of stock (manual flag)
- [ ] Uncheck "Out of Stock" → Product should become available again

## Notes
- The `outOfStock` flag takes precedence over `stockQuantity`
- Even if `stockQuantity > 0`, if `outOfStock = true`, the product is unavailable
- This provides flexibility for business logic beyond simple inventory counts
