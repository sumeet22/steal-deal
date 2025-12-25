# Category Reordering Feature

## Overview
Added drag-and-drop functionality to reorder categories in the admin dashboard. Categories can now be easily reordered by dragging and dropping them, and the order is persisted in the database.

## Changes Made

### 1. Backend Changes

#### **Category Model** (`server/models/Category.ts`)
- Added `order` field (Number, default: 0)
- Categories are now sorted by order when fetched

#### **Category Routes** (`server/routes/categories.ts`)
- Updated GET `/api/categories` to sort by order field
- Updated POST `/api/categories` to auto-assign order value
- Added POST `/api/categories/reorder` endpoint for bulk reordering

**Reorder Endpoint:**
```typescript
POST /api/categories/reorder
Body: { categoryIds: string[] }
Response: Updated categories array
```

### 2. Frontend Changes

#### **Types** (`types.ts`)
- Added `order?: number` to Category interface

#### **AppContext** (`context/AppContext.tsx`)
- Added `reorderCategories(categoryIds: string[])` function
- Function sends reorder request to backend and updates local state

#### **CategoryManagement Component** (`components/admin/CategoryManagement.tsx`)
- Added drag-and-drop functionality with HTML5 Drag and Drop API
- Visual feedback during drag operations:
  - Dragged item: opacity-50, scale-95
  - Drop target: indigo border, background highlight
  - Hover: border color change
- Added drag handle icon (grip dots)
- Disabled dragging while editing a category
- Added helpful tip text

## Features

### Drag and Drop
- **Drag Handle**: Visual grip icon (⋮⋮) for intuitive dragging
- **Visual Feedback**: 
  - Dragged item becomes semi-transparent
  - Drop target gets highlighted border
  - Smooth transitions
- **Smart Behavior**:
  - Dragging disabled while editing
  - Cursor changes to grab/grabbing
  - Hover effects on categories

### User Experience
- 💡 Helpful tip: "Drag and drop categories to reorder them"
- Instant visual feedback
- Toast notification on successful reorder
- Persisted order across page refreshes

## How It Works

1. **User drags a category** → `handleDragStart` sets draggedIndex
2. **User drags over another category** → `handleDragOver` sets dragOverIndex (visual highlight)
3. **User drops the category** → `handleDrop`:
   - Reorders categories array locally
   - Sends new order to backend via `reorderCategories()`
   - Backend updates order field for each category
   - Categories are refetched and displayed in new order
4. **Order persists** → Categories always load in the saved order

## API Usage

### Reorder Categories
```javascript
const categoryIds = ['id1', 'id2', 'id3']; // New order
reorderCategories(categoryIds);
```

### Backend Processing
```typescript
// Updates each category's order field
categoryIds.forEach((id, index) => {
  Category.findByIdAndUpdate(id, { order: index });
});
```

## Visual Design

- **Drag Handle**: Gray grip dots icon
- **Dragging State**: 50% opacity, 95% scale
- **Drop Target**: Indigo border + light background
- **Hover**: Indigo border on hover
- **Cursor**: Changes to grab/grabbing during interaction

## Benefits

✅ **Intuitive**: Drag and drop is familiar to users
✅ **Visual**: Clear feedback during interaction
✅ **Persistent**: Order saved to database
✅ **Fast**: Optimistic UI updates
✅ **Accessible**: Works with keyboard (native HTML5 drag)
✅ **Responsive**: Works on desktop and tablets

## Future Enhancements

- Add keyboard shortcuts (Ctrl+Up/Down) for reordering
- Add "Reset to Default Order" button
- Add category grouping/nesting
- Mobile touch support for drag-and-drop
