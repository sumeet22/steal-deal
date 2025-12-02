import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { Product, Category, Order, CartItem, OrderStatus, User } from '../types';
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [currentUser, setCurrentUserInternal] = useLocalStorage<User | null>('currentUser', null);
  const [token, setToken] = useLocalStorage<string | null>('token', null);
  const { showToast } = useToast();

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
        }));
        setCategories(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load categories from server', 'error');
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log('Raw products data:', data);
        const mapped: Product[] = (data || []).map((p: any) => {
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
            tags: p.tags || [],
            viewCount: p.viewCount || 0,
            addToCartCount: p.addToCartCount || 0,
            soldLast24Hours: p.soldLast24Hours || 0,
          } as Product;
        });
        setProducts(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load products from server', 'error');
      }
    };

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
        }));
        setUsers(mapped);
      } catch (err) {
        showToast('Error', 'Failed to load users from server', 'error');
      }
    };

    fetchCategories();
    fetchProducts();
    fetchUsers();
  }, [showToast]);

  const setCurrentUser = useCallback((user: User | null, newToken: string | null) => {
    setCurrentUserInternal(user);
    setToken(newToken);
  }, [setCurrentUserInternal, setToken]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    (async () => {
      try {
        const body = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.categoryId,
          image: productData.image,
          stockQuantity: productData.stockQuantity,
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
          tags: p.tags || [],
          viewCount: p.viewCount || 0,
          addToCartCount: p.addToCartCount || 0,
          soldLast24Hours: p.soldLast24Hours || 0,
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
          category: updatedProduct.categoryId,
          image: updatedProduct.image,
          stockQuantity: updatedProduct.stockQuantity,
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
          tags: p.tags || updatedProduct.tags || [],
          viewCount: p.viewCount || updatedProduct.viewCount || 0,
          addToCartCount: p.addToCartCount || updatedProduct.addToCartCount || 0,
          soldLast24Hours: p.soldLast24Hours || updatedProduct.soldLast24Hours || 0,
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

  const addToCart = useCallback((product: Product, quantity: number) => {
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
      return [...prev, { ...product, quantity }];
    });
    showToast('Success', `${product.name} added to cart`, 'success');
  }, [setCart, showToast]);

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

  const createOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      status: OrderStatus.New,
    };
    setOrders(prev => [newOrder, ...prev]);

    setProducts(prevProducts => {
      const itemsMap = new Map(orderData.items.map(item => [item.id, item.quantity]));
      return prevProducts.map(p => 
        itemsMap.has(p.id) ? { ...p, stockQuantity: p.stockQuantity - itemsMap.get(p.id)! } : p
      );
    });

    clearCart();
    showToast('Success!', 'Order placed successfully!', 'success');
  }, [setOrders, setProducts, clearCart, showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast('Success', 'Order status updated', 'success');
  }, [setOrders, showToast]);

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
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addUser,
    updateUser,
    deleteUser,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  createOrder,
  updateOrderStatus,
  setProducts,
  setCategories,
  setOrders,
  setUsers,
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