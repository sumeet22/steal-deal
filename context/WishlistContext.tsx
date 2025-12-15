import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { Product } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';

interface WishlistContextType {
    wishlist: string[]; // Array of product IDs
    wishlistProducts: Product[]; // Full product objects
    isInWishlist: (productId: string) => boolean;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    clearWishlist: () => void;
    toggleWishlist: (product: Product) => void;
    wishlistLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode; currentUserId?: string | null }> = ({
    children,
    currentUserId
}) => {
    const [wishlist, setWishlist] = useLocalStorage<string[]>('wishlist', []);
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const { showToast } = useToast();

    // Fetch wishlist from backend if user is logged in
    useEffect(() => {
        if (currentUserId) {
            fetchWishlistFromBackend();
        }
    }, [currentUserId]);

    const fetchWishlistFromBackend = async () => {
        if (!currentUserId) return;

        setWishlistLoading(true);
        try {
            const res = await fetch(`/api/wishlist?userId=${currentUserId}`);
            if (!res.ok) throw new Error('Failed to fetch wishlist');

            const data = await res.json();
            const productIds = data.items.map((item: any) =>
                item.productId._id || item.productId
            );

            setWishlist(productIds);

            // Set full product objects if available
            const products = data.items
                .map((item: any) => {
                    if (item.productId && typeof item.productId === 'object') {
                        const p = item.productId;
                        return {
                            id: p._id || p.id,
                            name: p.name,
                            price: p.price,
                            originalPrice: p.originalPrice,
                            description: p.description,
                            stockQuantity: p.stockQuantity,
                            categoryId: p.category?._id || p.category || p.categoryId,
                            image: p.image,
                            images: p.images,
                            tags: p.tags,
                            outOfStock: p.outOfStock,
                        } as Product;
                    }
                    return null;
                })
                .filter(Boolean);

            setWishlistProducts(products);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const isInWishlist = useCallback((productId: string): boolean => {
        return wishlist.includes(productId);
    }, [wishlist]);

    const addToWishlist = useCallback(async (product: Product) => {
        if (isInWishlist(product.id)) {
            showToast('Info', 'Product already in wishlist', 'info');
            return;
        }

        // Optimistic update
        setWishlist(prev => [...prev, product.id]);
        setWishlistProducts(prev => [...prev, product]);

        if (currentUserId) {
            // Save to backend
            try {
                const res = await fetch('/api/wishlist/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUserId,
                        productId: product.id
                    })
                });

                if (!res.ok) throw new Error('Failed to add to wishlist');
                showToast('Success', 'Added to wishlist', 'success');
            } catch (error) {
                // Revert on error
                setWishlist(prev => prev.filter(id => id !== product.id));
                setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
                showToast('Error', 'Failed to add to wishlist', 'error');
            }
        } else {
            // Guest user - localStorage only
            showToast('Success', 'Added to wishlist', 'success');
        }
    }, [wishlist, currentUserId, isInWishlist, showToast]);

    const removeFromWishlist = useCallback(async (productId: string) => {
        // Optimistic update
        setWishlist(prev => prev.filter(id => id !== productId));
        setWishlistProducts(prev => prev.filter(p => p.id !== productId));

        if (currentUserId) {
            // Remove from backend
            try {
                const res = await fetch('/api/wishlist/remove', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUserId,
                        productId
                    })
                });

                if (!res.ok) throw new Error('Failed to remove from wishlist');
                showToast('Success', 'Removed from wishlist', 'success');
            } catch (error) {
                // Revert on error
                setWishlist(prev => [...prev, productId]);
                showToast('Error', 'Failed to remove from wishlist', 'error');
            }
        } else {
            // Guest user - localStorage only
            showToast('Success', 'Removed from wishlist', 'success');
        }
    }, [currentUserId, showToast]);

    const clearWishlist = useCallback(async () => {
        // Optimistic update
        const prevWishlist = [...wishlist];
        const prevProducts = [...wishlistProducts];
        setWishlist([]);
        setWishlistProducts([]);

        if (currentUserId) {
            // Clear from backend
            try {
                const res = await fetch('/api/wishlist/clear', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId })
                });

                if (!res.ok) throw new Error('Failed to clear wishlist');
                showToast('Success', 'Wishlist cleared', 'success');
            } catch (error) {
                // Revert on error
                setWishlist(prevWishlist);
                setWishlistProducts(prevProducts);
                showToast('Error', 'Failed to clear wishlist', 'error');
            }
        } else {
            // Guest user - localStorage only
            showToast('Success', 'Wishlist cleared', 'success');
        }
    }, [wishlist, wishlistProducts, currentUserId, showToast]);

    const toggleWishlist = useCallback((product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    const value = {
        wishlist,
        wishlistProducts,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        toggleWishlist,
        wishlistLoading,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        // Return a safe default instead of throwing during development/HMR
        console.warn('useWishlist called outside WishlistProvider, returning empty wishlist');
        return {
            wishlist: [],
            wishlistProducts: [],
            isInWishlist: () => false,
            addToWishlist: () => { },
            removeFromWishlist: () => { },
            clearWishlist: () => { },
            toggleWishlist: () => { },
            wishlistLoading: false,
        };
    }
    return context;
};
