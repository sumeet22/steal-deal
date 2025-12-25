# Product Reordering Within Categories Feature

## Overview
Added drag-and-drop functionality to reorder products within specific categories in the admin dashboard. Products can now be easily reordered by dragging and dropping them in a modal, and the order is persisted in the database.

## Changes Made

### 1. Backend Changes

#### **Product Model** (`server/models/Product.ts`)
- Added `categoryOrder` field (Number, default: 0)
- Updated index to include `categoryOrder` for efficient sorting
- Products are now sorted by `categoryOrder` first, then by other criteria

**Index:**
```typescript
ProductSchema.index({ category: 1, categoryOrder: 1, createdAt: -1 });
```

#### **Product Routes** (`server/routes/products.ts`)
- Updated GET `/api/products` to sort by `categoryOrder` when filtering by category
- Added POST `/api/products/reorder` endpoint for bulk reordering

**Reorder Endpoint:**
```typescript
POST /api/products/reorder
Body: { 
  productIds: string[],  // Array of product IDs in new order
  categoryId?: string    // Optional category ID for filtering
}
Response: Updated products array
```

**Sort Logic:**
```typescript
// When viewing a category, sort by categoryOrder first
const sortQuery = category ? { categoryOrder: 1, ...otherSort } : { ...otherSort };
```

### 2. Frontend Changes

#### **Types** (`types.ts`)
- Added `categoryOrder?: number` to Product interface

#### **AppContext** (`context/AppContext.tsx`)
- Added `reorderProducts(productIds: string[], categoryId?: string)` function
- Function sends reorder request to backend and updates local state

#### **ProductReorderModal Component** (`components/admin/ProductReorderModal.tsx`)
- New modal component for reordering products
- Drag-and-drop functionality with HTML5 Drag and Drop API
- Visual feedback during drag operations
- Shows product image, name, price, and order number
- Save/Cancel buttons

#### **ProductManagement Component** (`components/admin/ProductManagement.tsx`)
- Added "Reorder" button (only visible when a category is selected)
- Button opens ProductReorderModal
- Passes filtered products and category info to modal

## Features

### Product Reordering Modal

**Visual Elements:**
- Product card with image, name, and price
- Drag handle icon (grip dots)
- Order number (#1, #2, etc.)
- Save and Cancel buttons

**Drag and Drop:**
- **Drag Handle**: Visual grip icon for intuitive dragging
- **Visual Feedback**:
  - Dragged item: opacity-50, scale-95
  - Drop target: indigo border, background highlight
  - Smooth transitions
- **Smart Behavior**:
  - Products sorted by current `categoryOrder`
  - Real-time reordering in modal
  - Persisted on save

### User Experience

**Admin Workflow:**
1. Go to Product Management
2. Select a category from dropdown
3. Click "Reorder" button (purple button with grip icon)
4. Modal opens showing all products in that category
5. Drag and drop products to reorder
6. Click "Save Order" to persist changes
7. Products now display in new order everywhere

**Features:**
- 💡 Helpful tip in modal
- Instant visual feedback
- Toast notification on successful reorder
- Persisted order across page refreshes
- Only affects products within the selected category

## How It Works

### Reordering Flow

1. **User selects category** → "Reorder" button appears
2. **User clicks "Reorder"** → Modal opens with products sorted by `categoryOrder`
3. **User drags a product** → Visual feedback shows drag state
4. **User drops the product** → Local array reorders
5. **User clicks "Save Order"** → `reorderProducts()` called:
   - Sends new order to backend
   - Backend updates `categoryOrder` field for each product
   - Products refetched and displayed in new order
6. **Order persists** → Products always load in saved order within category

### Database Structure

```javascript
Product {
  _id: ObjectId,
  name: String,
  category: ObjectId,
  categoryOrder: Number,  // NEW: Order within category
  // ... other fields
}
```

### Sorting Logic

**When viewing a category:**
```javascript
// Frontend request
GET /api/products?category=categoryId

// Backend sorting
.sort({ categoryOrder: 1, createdAt: -1 })
// First by custom order, then by creation date
```

**When viewing all products:**
```javascript
// No categoryOrder sorting, uses default sort
.sort({ createdAt: -1 })
```

## API Usage

### Reorder Products
```javascript
const productIds = ['id1', 'id2', 'id3']; // New order
const categoryId = 'categoryId';
reorderProducts(productIds, categoryId);
```

### Backend Processing
```typescript
// Updates each product's categoryOrder field
productIds.forEach((id, index) => {
  Product.findByIdAndUpdate(id, { categoryOrder: index });
});
```

## Visual Design

### Reorder Button
- **Color**: Purple (bg-purple-600)
- **Icon**: Grip dots (⋮⋮)
- **Text**: "Reorder"
- **Visibility**: Only when category selected

### Modal
- **Size**: max-w-2xl, max-h-90vh
- **Sections**: Header, Content (scrollable), Footer
- **Product Cards**:
  - Drag handle on left
  - Product image (60x60)
  - Name and price
  - Order number on right

### Drag States
- **Dragging**: 50% opacity, 95% scale
- **Drop Target**: Indigo border + light background
- **Hover**: Cursor changes to grab/grabbing

## Benefits

✅ **Category-Specific**: Order products within each category independently
✅ **Intuitive**: Drag and drop is familiar to users
✅ **Visual**: Clear feedback during interaction
✅ **Persistent**: Order saved to database
✅ **Fast**: Optimistic UI updates
✅ **Flexible**: Works with any number of products
✅ **Scalable**: Efficient database indexing

## Use Cases

1. **Featured Products**: Put best-selling items at the top
2. **Seasonal Ordering**: Highlight seasonal products
3. **Price-Based**: Order by price range
4. **New Arrivals**: Show newest products first
5. **Custom Curation**: Manual editorial control

## Performance Considerations

- **Database Index**: Compound index on `(category, categoryOrder, createdAt)` for fast queries
- **Lazy Loading**: Modal only loads when opened
- **Optimistic Updates**: UI updates immediately, syncs with backend
- **Batch Updates**: All products updated in single API call

## Future Enhancements

- Add keyboard shortcuts (Ctrl+Up/Down) for reordering
- Add "Reset to Default Order" button
- Bulk reorder across multiple categories
- Auto-numbering gaps when products are deleted
- Drag-and-drop directly in product list (without modal)
- Mobile touch support for drag-and-drop
