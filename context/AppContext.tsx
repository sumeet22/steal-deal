import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { Product, Category, Order, CartItem, OrderStatus, User, Address, Coupon } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';

interface AppContextType {
  products: Product[];
  categories: Category[];
  users: User[];
  cart: CartItem[];
  orders: Order[];
  currentUser: User | null;
  setCurrentUser: (user: User | null, token: string | null) => void;
  token: string | null;
  logout: () => void;

  // Lazy loading functions
  fetchProductsByCategory: (categoryId: string, page?: number, limit?: number) => Promise<{ products: Product[]; hasMore: boolean; total: number }>;
  fetchProductsBySearch: (searchQuery: string, page?: number, limit?: number) => Promise<{ products: Product[]; hasMore: boolean; total: number }>;
  fetchNewArrivals: (page?: number, limit?: number, searchQuery?: string) => Promise<{ products: Product[]; hasMore: boolean; total: number }>;
  fetchAllProductsForAdmin: () => Promise<void>; // For admin panel only

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  reorderProducts: (productIds: string[], categoryId?: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  reorderCategories: (categoryIds: string[]) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  validateAndUpdateCart: () => Promise<{ hasChanges: boolean; removedItems: string[]; priceChanges: Array<{ name: string; oldPrice: number; newPrice: number }>; stockIssues: string[] }>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order | void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getDisplayPrice: (price: number) => number;
  pricePercentage: number;
  setPricePercentage: (val: number) => void;
  shippingFee: number;
  setShippingFee: (val: number) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (val: number) => void;
  coupons: Coupon[];
  fetchCoupons: () => Promise<void>;
  validateCoupon: (code: string, amount: number) => Promise<Coupon>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Loading states
  productsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUserInternal] = useLocalStorage<User | null>('currentUser', null);
  const [token, setToken] = useLocalStorage<string | null>('token', null);
  const [pricePercentage, setPricePercentageInternal] = useState<number>(100);
  const [shippingFee, setShippingFeeInternal] = useState<number>(0);
  const [freeShippingThreshold, setFreeShippingThresholdInternal] = useState<number>(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { showToast } = useToast();

  const mapProductData = useCallback((p: any): Product => {
    const categoryId = p.category && (typeof p.category === 'object' ? (p.category._id || p.category.id) : p.category);
    return {
      id: p._id || p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      description: p.description || '',
      stockQuantity: p.stockQuantity ?? p.stock ?? 0,
      categoryId: categoryId || '',
      image: p.image || p.imageUrl || undefined,
      images: p.images || undefined,
      tags: p.tags || [],
      viewCount: p.viewCount ?? undefined,
      addToCartCount: p.addToCartCount ?? undefined,
      soldLast24Hours: p.soldLast24Hours ?? undefined,
      outOfStock: p.outOfStock ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isLimitedEdition: p.isLimitedEdition ?? false,
      isActive: p.isActive ?? true,
      categoryOrder: p.categoryOrder ?? 0,
    };
  }, []);

  const mapOrderData = useCallback((o: any): Order => ({
    id: o._id || o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    items: (o.items || []).map((item: any) => ({
      ...mapProductData(item),
      quantity: item.quantity
    })),
    total: o.total,
    status: o.status,
    paymentMethod: o.paymentMethod,
    deliveryMethod: o.deliveryMethod || 'home_delivery',
    shippingCost: o.shippingCost || 0,
    appliedCoupon: o.appliedCoupon,
    paymentProof: o.paymentProof,
    createdAt: o.createdAt,
  }), [mapProductData]);

  const mapCouponData = useCallback((c: any): Coupon => ({
    id: c._id || c.id,
    code: c.code || '',
    description: c.description || '',
    discountPercentage: c.discountPercentage || 0,
    minOrderAmount: c.minOrderAmount || 0,
    expiryDate: c.expiryDate || '',
    isActive: c.isActive !== false,
    usageCount: c.usageCount || 0,
    isPublic: c.isPublic !== false,
  }), []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        const mapped: Category[] = (data || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          image: c.image || c.imageUrl || undefined,
          order: c.order,
          isActive: c.isActive,
        }));
        setCategories(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load categories from server', 'error');
      }
    };

    // NOTE: Products are NO LONGER loaded upfront
    // They will be loaded lazily when:
    // 1. User selects a category
    // 2. User performs a search
    // 3. Admin views product management
    // This prevents loading 1000s of products on app start

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        console.debug('fetchUsers raw users:', data);
        const mapped: User[] = (data || []).map((u: any) => ({
          id: u._id || u.id,
          name: u.username || u.name || u.username || 'Unknown',
          phone: u.phone || u.phoneNumber || '',
          role: u.isAdmin ? 'admin' : (u.role === 'admin' ? 'admin' : 'user'),
          addresses: u.addresses || [],
        }));
        setUsers(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load users from server', 'error');
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        const mapped: Order[] = (data || []).map(mapOrderData);
        setOrders(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load orders from server', 'error');
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setPricePercentageInternal(data.pricePercentage || 100);
        setShippingFeeInternal(data.shippingFee || 0);
        setFreeShippingThresholdInternal(data.freeShippingThreshold || 0);
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    };

    const fetchCoupons = async () => {
      try {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/coupons', { headers }); // Admin fetches all
        if (!res.ok) throw new Error('Failed to fetch coupons');
        const data = await res.json();
        setCoupons((data || []).map(mapCouponData));
      } catch (err) {
        console.error('Coupons fetch error:', err);
      }
    };

    fetchCategories();
    fetchUsers();
    fetchOrders();
    fetchSettings();
    fetchCoupons();
  }, [showToast, token]);

  const updateSettings = useCallback(async (newSettings: { pricePercentage?: number, shippingFee?: number, freeShippingThreshold?: number }) => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(newSettings),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      const data = await res.json();
      if (data.pricePercentage !== undefined) setPricePercentageInternal(data.pricePercentage);
      if (data.shippingFee !== undefined) setShippingFeeInternal(data.shippingFee);
      if (data.freeShippingThreshold !== undefined) setFreeShippingThresholdInternal(data.freeShippingThreshold);

      showToast('Success', 'Settings updated successfully', 'success');
    } catch (err) {
      showToast('Error', 'Failed to update settings', 'error');
    }
  }, [token, showToast]);

  const setPricePercentage = (val: number) => updateSettings({ pricePercentage: val });
  const setShippingFee = (val: number) => updateSettings({ shippingFee: val });
  const setFreeShippingThreshold = (val: number) => updateSettings({ freeShippingThreshold: val });

  const fetchCoupons = useCallback(async () => {
    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/coupons', { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCoupons((data || []).map(mapCouponData));
    } catch (err) {
      showToast('Error', 'Failed to reload coupons', 'error');
    }
  }, [token, showToast]);

  const validateCoupon = useCallback(async (code: string, amount: number): Promise<Coupon> => {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartAmount: amount })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid coupon');
    }
    return mapCouponData(data);
  }, [mapCouponData]);

  const addCoupon = useCallback(async (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify(couponData)
      });
      if (!res.ok) throw new Error('Failed to save coupon');
      showToast('Success', 'Coupon created successfully', 'success');
      fetchCoupons();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  }, [token, showToast, fetchCoupons]);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Success', 'Coupon deleted', 'success');
      fetchCoupons();
    } catch (err) {
      showToast('Error', 'Failed to delete coupon', 'error');
    }
  }, [token, showToast, fetchCoupons]);

  const setCurrentUser = useCallback((user: User | null, newToken: string | null) => {
    setCurrentUserInternal(user);
    setToken(newToken);
  }, [setCurrentUserInternal, setToken]);

  const logout = useCallback(() => {
    setCurrentUserInternal(null);
    setToken(null);
    showToast('Success', 'Logged out successfully', 'success');
  }, [setCurrentUserInternal, setToken, showToast]);

  const addAddress = useCallback(async (addressData: any) => {
    if (!currentUser) return;

    // Safety check for user ID
    const userId = currentUser.id || (currentUser as any)._id; // Handle both id and _id

    if (!userId) {
      console.error('User ID missing in addAddress. Current User:', currentUser);
      showToast('Error', 'User ID not found. Please log out and back in.', 'error');
      return;
    }

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/users/${userId}/addresses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(addressData)
      });
      if (!res.ok) throw new Error('Failed to add address');
      const updatedAddresses = await res.json();

      // Update current user state with new addresses
      setCurrentUserInternal(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
      showToast('Success', 'Address added successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to save address', 'error');
    }
  }, [currentUser, token, setCurrentUserInternal, showToast]);

  const getDisplayPrice = useCallback((basePrice: number) => {
    return (basePrice * pricePercentage) / 100;
  }, [pricePercentage]);

  // Fetch products by category with pagination
  const fetchProductsByCategory = useCallback(async (
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[]; hasMore: boolean; total: number }> => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        category: categoryId,
        page: page.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      const mappedProducts = (data.products || []).map(mapProductData);

      // Update products state (append for pagination or replace for new category)
      if (page === 1) {
        setProducts(mappedProducts);
      } else {
        setProducts(prev => [...prev, ...mappedProducts]);
      }

      return {
        products: mappedProducts,
        hasMore: data.pagination?.hasMore || false,
        total: data.pagination?.total || 0
      };
    } catch (err) {
      showToast('Error', 'Failed to load products', 'error');
      return { products: [], hasMore: false, total: 0 };
    } finally {
      setProductsLoading(false);
    }
  }, [showToast, mapProductData]);

  // Fetch products by search query with pagination
  const fetchProductsBySearch = useCallback(async (
    searchQuery: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[]; hasMore: boolean; total: number }> => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      const mappedProducts = (data.products || []).map(mapProductData);

      // Update products state
      if (page === 1) {
        setProducts(mappedProducts);
      } else {
        setProducts(prev => [...prev, ...mappedProducts]);
      }

      return {
        products: mappedProducts,
        hasMore: data.pagination?.hasMore || false,
        total: data.pagination?.total || 0
      };
    } catch (err) {
      showToast('Error', 'Failed to search products', 'error');
      return { products: [], hasMore: false, total: 0 };
    } finally {
      setProductsLoading(false);
    }
  }, [showToast, mapProductData]);

  // Fetch new arrivals and limited editions with pagination
  const fetchNewArrivals = useCallback(async (
    page: number = 1,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ products: Product[]; hasMore: boolean; total: number }> => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchQuery && searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/products/new-arrivals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch new arrivals');

      const data = await res.json();
      const mappedProducts = (data.products || []).map(mapProductData);

      // Update products state
      if (page === 1) {
        setProducts(mappedProducts);
      } else {
        setProducts(prev => [...prev, ...mappedProducts]);
      }

      return {
        products: mappedProducts,
        hasMore: data.pagination?.hasMore || false,
        total: data.pagination?.total || 0
      };
    } catch (err) {
      showToast('Error', 'Failed to load new arrivals', 'error');
      return { products: [], hasMore: false, total: 0 };
    } finally {
      setProductsLoading(false);
    }
  }, [showToast, mapProductData]);

  // Fetch ALL products for admin panel (no pagination)
  const fetchAllProductsForAdmin = useCallback(async (): Promise<void> => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '1000', // High limit for admin
        includeInactive: 'true'
      });

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      const mappedProducts = (data.products || []).map(mapProductData);

      setProducts(mappedProducts);
    } catch (err) {
      showToast('Error', 'Failed to load products', 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [showToast, mapProductData]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    (async () => {
      try {
        const body = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          category: productData.categoryId,
          image: productData.image,
          images: productData.images,
          stockQuantity: productData.stockQuantity,
          tags: productData.tags,
          viewCount: productData.viewCount,
          addToCartCount: productData.addToCartCount,
          soldLast24Hours: productData.soldLast24Hours,
          outOfStock: productData.outOfStock,
          isNewArrival: productData.isNewArrival,
          isLimitedEdition: productData.isLimitedEdition,
          isActive: productData.isActive,
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/products', { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to create product');
        const p: any = await res.json();
        const categoryId = p.category && (typeof p.category === 'object' ? (p.category._id || p.category.id) : p.category);
        const mapped: Product = {
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          description: p.description || '',
          stockQuantity: p.stockQuantity ?? p.stock ?? (productData.stockQuantity ?? 0),
          categoryId: categoryId || productData.categoryId || '',
          image: p.image || p.imageUrl || productData.image || undefined,
          images: p.images || productData.images || undefined,
          tags: p.tags || [],
          viewCount: p.viewCount ?? undefined,
          addToCartCount: p.addToCartCount ?? undefined,
          soldLast24Hours: p.soldLast24Hours ?? undefined,
          outOfStock: p.outOfStock ?? productData.outOfStock ?? false,
          isNewArrival: p.isNewArrival ?? productData.isNewArrival ?? false,
          isLimitedEdition: p.isLimitedEdition ?? productData.isLimitedEdition ?? false,
          isActive: p.isActive ?? true,
        } as Product;
        setProducts(prev => [...prev, mapped]);
        showToast('Success', 'Product added successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to add product', 'error');
      }
    })();
  }, [setProducts, showToast, token]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    (async () => {
      try {
        const body = {
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          originalPrice: updatedProduct.originalPrice,
          category: updatedProduct.categoryId,
          image: updatedProduct.image,
          images: updatedProduct.images,
          stockQuantity: updatedProduct.stockQuantity,
          tags: updatedProduct.tags,
          viewCount: updatedProduct.viewCount,
          addToCartCount: updatedProduct.addToCartCount,
          soldLast24Hours: updatedProduct.soldLast24Hours,
          outOfStock: updatedProduct.outOfStock,
          isNewArrival: updatedProduct.isNewArrival,
          isLimitedEdition: updatedProduct.isLimitedEdition,
          isActive: updatedProduct.isActive,
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/products/${updatedProduct.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to update product');
        const p: any = await res.json();
        const categoryId = p.category && (typeof p.category === 'object' ? (p.category._id || p.category.id) : p.category);
        const mapped: Product = {
          id: p._1 || p._id || p.id || updatedProduct.id,
          name: p.name || updatedProduct.name,
          price: p.price ?? updatedProduct.price,
          originalPrice: p.originalPrice ?? updatedProduct.originalPrice ?? null,
          description: p.description || updatedProduct.description || '',
          stockQuantity: p.stockQuantity ?? p.stock ?? updatedProduct.stockQuantity ?? 0,
          categoryId: categoryId || updatedProduct.categoryId || '',
          image: p.image || p.imageUrl || updatedProduct.image || undefined,
          images: p.images || updatedProduct.images || undefined,
          tags: p.tags || updatedProduct.tags || [],
          viewCount: p.viewCount ?? undefined,
          addToCartCount: p.addToCartCount ?? undefined,
          soldLast24Hours: p.soldLast24Hours ?? undefined,
          outOfStock: p.outOfStock ?? updatedProduct.outOfStock ?? false,
          isNewArrival: p.isNewArrival ?? updatedProduct.isNewArrival ?? false,
          isLimitedEdition: p.isLimitedEdition ?? updatedProduct.isLimitedEdition ?? false,
          isActive: p.isActive ?? true,
        } as Product;
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? mapped : p));
        showToast('Success', 'Product updated successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to update product', 'error');
      }
    })();
  }, [setProducts, showToast, token]);

  const deleteProduct = useCallback((productId: string) => {
    (async () => {
      try {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete product');
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('Success', 'Product deleted successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to delete product', 'error');
      }
    })();
  }, [setProducts, showToast, token]);

  const reorderProducts = useCallback((productIds: string[], categoryId?: string) => {
    (async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/products/reorder', {
          method: 'POST',
          headers,
          body: JSON.stringify({ productIds, categoryId })
        });
        if (!res.ok) throw new Error('Failed to reorder products');
        const updatedProducts = await res.json();
        const mapped: Product[] = (updatedProducts || []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          description: p.description || '',
          stockQuantity: p.stockQuantity ?? p.stock ?? 0,
          categoryId: (p.category && typeof p.category === 'object') ? (p.category._id || p.category.id) : (p.category || ''),
          image: p.image || p.imageUrl || undefined,
          images: p.images || undefined,
          tags: p.tags || [],
          viewCount: p.viewCount ?? undefined,
          addToCartCount: p.addToCartCount ?? undefined,
          soldLast24Hours: p.soldLast24Hours ?? undefined,
          outOfStock: p.outOfStock ?? false,
          isNewArrival: p.isNewArrival ?? false,
          isLimitedEdition: p.isLimitedEdition ?? false,
          isActive: p.isActive ?? true,
          categoryOrder: p.categoryOrder ?? 0,
        }));
        setProducts(mapped);
        showToast('Success', 'Products reordered successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to reorder products', 'error');
      }
    })();
  }, [setProducts, showToast, token]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    // Check if product is marked as out of stock
    if (product.outOfStock || product.stockQuantity <= 0) {
      showToast('Error', 'This product is out of stock and cannot be added to cart.', 'error');
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          showToast('Error', `Cannot add more than ${product.stockQuantity} items.`, 'error');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      if (quantity > product.stockQuantity) {
        showToast('Error', `Only ${product.stockQuantity} items in stock.`, 'error');
        return prev;
      }

      // Add hiked prices to cart items
      const displayPrice = getDisplayPrice(product.price);
      const displayOriginalPrice = product.originalPrice ? getDisplayPrice(product.originalPrice) : undefined;

      return [...prev, { ...product, quantity, price: displayPrice, originalPrice: displayOriginalPrice }];
    });
    showToast('Success', `${product.name} added to cart`, 'success');
  }, [setCart, showToast, getDisplayPrice]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Success', 'Item removed from cart', 'success');
  }, [setCart, showToast]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const itemInCart = cart.find(item => item.id === productId);
      const product = products.find(p => p.id === productId);
      if (itemInCart && product && quantity > product.stockQuantity) {
        showToast('Error', `Only ${product.stockQuantity} items available in stock.`, 'error');
        return;
      }
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  }, [setCart, removeFromCart, showToast, cart, products]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  // Validate cart items against current product data
  const validateAndUpdateCart = useCallback(async () => {
    const result = {
      hasChanges: false,
      removedItems: [] as string[],
      priceChanges: [] as Array<{ name: string; oldPrice: number; newPrice: number }>,
      stockIssues: [] as string[]
    };

    if (cart.length === 0) return result;

    try {
      // Fetch current product data for all cart items
      const productIds = cart.map(item => item.id);
      const productPromises = productIds.map(id =>
        fetch(`/api/products/${id}`).then(res => res.ok ? res.json() : null)
      );

      const currentProducts = await Promise.all(productPromises);

      const updatedCart = cart.map((cartItem, index) => {
        const currentProduct = currentProducts[index];

        // Product no longer exists or is inactive
        if (!currentProduct || currentProduct.isActive === false) {
          result.removedItems.push(cartItem.name);
          result.hasChanges = true;
          return null;
        }

        // Map current product data
        const latestProduct = mapProductData(currentProduct);

        // Check if out of stock
        if (latestProduct.outOfStock || latestProduct.stockQuantity <= 0) {
          result.removedItems.push(cartItem.name);
          result.stockIssues.push(`${cartItem.name} is now out of stock`);
          result.hasChanges = true;
          return null;
        }

        // Check if quantity exceeds available stock
        let adjustedQuantity = cartItem.quantity;
        if (cartItem.quantity > latestProduct.stockQuantity) {
          adjustedQuantity = latestProduct.stockQuantity;
          result.stockIssues.push(`${cartItem.name} quantity reduced to ${latestProduct.stockQuantity} (available stock)`);
          result.hasChanges = true;
        }

        // Check for price changes
        const currentHikedPrice = getDisplayPrice(latestProduct.price);
        if (cartItem.price !== currentHikedPrice) {
          result.priceChanges.push({
            name: cartItem.name,
            oldPrice: cartItem.price,
            newPrice: currentHikedPrice
          });
          result.hasChanges = true;
        }

        // Return updated cart item with latest data (hiked price)
        return {
          ...latestProduct,
          price: currentHikedPrice,
          originalPrice: latestProduct.originalPrice ? getDisplayPrice(latestProduct.originalPrice) : undefined,
          quantity: adjustedQuantity
        };
      }).filter(item => item !== null) as CartItem[];

      // Update cart if there are changes
      if (result.hasChanges) {
        setCart(updatedCart);
      }

      return result;
    } catch (error) {
      console.error('Error validating cart:', error);
      return result;
    }
  }, [cart, setCart, mapProductData]);

  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      const body = {
        ...orderData,
      };
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/orders', { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to create order');
      const newOrderData = await res.json();

      const newOrder: Order = {
        id: newOrderData._id || newOrderData.id,
        customerName: newOrderData.customerName,
        customerPhone: newOrderData.customerPhone,
        shippingAddress: newOrderData.shippingAddress,
        items: newOrderData.items || [],
        total: newOrderData.total,
        status: newOrderData.status,
        paymentMethod: newOrderData.paymentMethod,
        deliveryMethod: newOrderData.deliveryMethod,
        shippingCost: newOrderData.shippingCost,
        paymentProof: newOrderData.paymentProof,
        createdAt: newOrderData.createdAt,
      };

      setOrders(prev => [newOrder, ...prev]);

      if (newOrder.status !== 'Pending') {
        setProducts(prevProducts => {
          const itemsMap = new Map(orderData.items.map(item => [item.id, item.quantity]));
          return prevProducts.map(p =>
            itemsMap.has(p.id) ? { ...p, stockQuantity: p.stockQuantity - itemsMap.get(p.id)! } : p
          );
        });

        clearCart();
        showToast('Success!', 'Order placed successfully!', 'success');
      }

      return newOrder;
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to place order', 'error');
    }
  }, [setOrders, setProducts, clearCart, showToast, token]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    (async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error('Failed to update order status');

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        showToast('Success', 'Order status updated', 'success');
      } catch (err) {
        showToast('Error', 'Failed to update order status', 'error');
      }
    })();
  }, [setOrders, showToast, token]);

  const addCategory = useCallback((categoryData: Omit<Category, 'id'>) => {
    (async () => {
      try {
        const body = {
          name: categoryData.name,
          image: (categoryData as any).image,
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/categories', { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to create category');
        const c: any = await res.json();
        const mapped: Category = {
          id: c._id || c.id,
          name: c.name,
          image: c.image || c.imageUrl || (categoryData as any).image || undefined,
        } as Category;
        setCategories(prev => [...prev, mapped]);
        showToast('Success', 'Category added successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to add category', 'error');
      }
    })();
  }, [setCategories, showToast, token]);

  const updateCategory = useCallback((updatedCategory: Category) => {
    (async () => {
      try {
        const body = {
          name: updatedCategory.name,
          image: (updatedCategory as any).image,
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/categories/${updatedCategory.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to update category');
        const c: any = await res.json();
        const mapped: Category = {
          id: c._id || c.id || updatedCategory.id,
          name: c.name || updatedCategory.name,
          image: c.image || c.imageUrl || updatedCategory.image || undefined,
          order: c.order,
          isActive: c.isActive,
        } as Category;
        setCategories(prev => prev.map(cat => cat.id === updatedCategory.id ? mapped : cat));
        showToast('Success', 'Category updated successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to update category', 'error');
      }
    })();
  }, [setCategories, showToast, token]);


  const deleteCategory = useCallback((categoryId: string) => {
    (async () => {
      try {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete category');
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        showToast('Success', 'Category deleted successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to delete category', 'error');
      }
    })();
  }, [setCategories, showToast, token]);

  const reorderCategories = useCallback((categoryIds: string[]) => {
    (async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/categories/reorder', {
          method: 'POST',
          headers,
          body: JSON.stringify({ categoryIds })
        });
        if (!res.ok) throw new Error('Failed to reorder categories');
        const updatedCategories = await res.json();
        const mapped: Category[] = (updatedCategories || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          image: c.image || c.imageUrl || undefined,
          order: c.order || 0,
        }));
        setCategories(mapped);
        showToast('Success', 'Categories reordered successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to reorder categories', 'error');
      }
    })();
  }, [setCategories, showToast, token]);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    (async () => {
      try {
        const body: any = {
          name: userData.name,
          email: `${userData.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
          phone: (userData as any).phone || '',
          password: 'password',
          role: userData.role || 'user',
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to create user');
        const u: any = await res.json();
        const mapped: User = {
          id: u._id || u.id,
          name: u.username || u.name || userData.name,
          phone: (userData as any).phone || '',
          role: u.isAdmin ? 'admin' : (u.role === 'admin' ? 'admin' : 'user'),
          addresses: u.addresses || [],
        } as User;
        setUsers(prev => [...prev, mapped]);
        showToast('Success', 'User added successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to add user', 'error');
      }
    })();
  }, [setUsers, showToast, token]);

  const updateUser = useCallback((updatedUser: User) => {
    (async () => {
      try {
        const body: any = {
          name: updatedUser.name,
          email: `${updatedUser.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
          phone: updatedUser.phone || '',
          role: updatedUser.role || 'user',
        };
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/users/${updatedUser.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
        console.debug('updateUser response status:', res.status);
        const u: any = await res.json();
        console.debug('updateUser response json:', u);
        const mapped: User = {
          id: u._id || u.id || updatedUser.id,
          name: u.username || u.name || updatedUser.name,
          phone: updatedUser.phone || '',
          role: u.isAdmin ? 'admin' : (u.role === 'admin' ? 'admin' : 'user'),
          addresses: u.addresses || [],
        } as User;
        setUsers(prev => prev.map(us => us.id === updatedUser.id ? mapped : us));
        showToast('Success', 'User updated successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to update user', 'error');
      }
    })();
  }, [setUsers, showToast, token]);

  const deleteUser = useCallback((userId: string) => {
    (async () => {
      try {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete user');
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast('Success', 'User deleted successfully', 'success');
      } catch (err) {
        showToast('Error', 'Failed to delete user', 'error');
      }
    })();
  }, [setUsers, showToast, token]);

  const value = {
    products,
    categories,
    users,
    cart,
    orders,
    currentUser,
    setCurrentUser,
    token,
    logout,
    fetchProductsByCategory,
    fetchProductsBySearch,
    fetchNewArrivals,
    fetchAllProductsForAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addUser,
    updateUser,
    deleteUser,
    addAddress,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    validateAndUpdateCart,
    createOrder,
    updateOrderStatus,
    getDisplayPrice,
    pricePercentage,
    setPricePercentage,
    shippingFee,
    setShippingFee,
    freeShippingThreshold,
    setFreeShippingThreshold,
    coupons,
    fetchCoupons,
    validateCoupon,
    addCoupon,
    deleteCoupon,
    setProducts,
    setCategories,
    setOrders,
    setUsers,
    productsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};