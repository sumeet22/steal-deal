export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface ProductImage {
  url: string;
  order: number;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  stockQuantity: number;
  categoryId: string;
  image?: string; // Deprecated, kept for backward compatibility
  images?: ProductImage[]; // New: array of images (max 5)
  tags?: ('new' | 'sale')[];
  viewCount?: number;
  addToCartCount?: number;
  soldLast24Hours?: number;
  outOfStock?: boolean; // Manual or automatic out of stock flag
  isNewArrival?: boolean; // Mark product for New Arrivals page
  isLimitedEdition?: boolean; // Mark product as limited edition
  isActive?: boolean; // Controls global visibility
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  New = 'New',
  Accepted = 'Accepted',
  Shipped = 'Shipped',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryMethod: 'store_pickup' | 'home_delivery';
  shippingCost: number;
  paymentMethod: 'COD' | 'Online Payment';
  paymentProof?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  isBanned?: boolean;
  email?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}