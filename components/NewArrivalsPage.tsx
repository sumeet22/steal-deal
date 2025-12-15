import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, SparklesIcon } from './Icons';
import { Product } from '../types';
import { ProductCard } from './Storefront';

interface NewArrivalsPageProps {
    onProductClick: (productId: string) => void;
    onBack: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const NewArrivalsPage: React.FC<NewArrivalsPageProps> = ({ onProductClick, onBack }) => {
    const { products, cart, addToCart, updateCartQuantity, fetchNewArrivals, productsLoading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch new arrivals on mount and when search changes
    useEffect(() => {
        setCurrentPage(1);
        fetchNewArrivals(1, 20, searchTerm).then(result => {
            setHasMore(result.hasMore);
        });
    }, [searchTerm, fetchNewArrivals]);

    // Infinite scroll - load more when sentinel element is visible
    useEffect(() => {
        if (!loadMoreRef.current || productsLoading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !productsLoading) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    fetchNewArrivals(nextPage, 20, searchTerm).then(result => {
                        setHasMore(result.hasMore);
                    });
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0.1
            }
        );

        observer.observe(loadMoreRef.current);

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [currentPage, hasMore, productsLoading, searchTerm, fetchNewArrivals]);

    // Create a memoized map of cart items by product ID
    const cartItemsMap = useMemo(() => {
        const map = new Map<string, { id: string; quantity: number }>();
        cart.forEach(item => {
            map.set(item.id, { id: item.id, quantity: item.quantity });
        });
        return map;
    }, [cart]);

    // Memoized callbacks
    const handleAddToCart = useCallback((product: Product) => {
        addToCart(product, 1);
    }, [addToCart]);

    const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
        updateCartQuantity(productId, quantity);
    }, [updateCartQuantity]);

    const handleProductClick = useCallback((productId: string) => {
        onProductClick(productId);
    }, [onProductClick]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="space-y-8 pb-10">
            <Helmet>
                <title>New Arrivals & Limited Editions | Steal Deal</title>
                <meta name="description" content="Discover the latest anime merchandise, new arrivals, and limited edition collectibles at Steal Deal." />
                <meta property="og:title" content="New Arrivals & Limited Editions | Steal Deal" />
                <meta property="og:description" content="Latest anime merchandise and limited edition collectibles." />
            </Helmet>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
                <ChevronLeftIcon />
                Back to Store
            </button>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 shadow-2xl min-h-[300px] flex items-center justify-center text-center px-4"
            >
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Animated Background Blobs */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-4 p-6">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-sm font-semibold mb-4 backdrop-blur-sm">
                            <SparklesIcon />
                            Latest Collection
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200 mb-2 drop-shadow-sm">
                            New Arrivals & Limited Editions
                        </h1>
                        <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover the latest anime merchandise and exclusive limited edition collectibles before they're gone!
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Search Bar */}
            <div className="relative flex-grow max-w-lg mx-auto">
                <input
                    type="text"
                    placeholder="Search new arrivals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border rounded-full bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <SearchIcon />
                </div>
            </div>

            {/* Products Count */}
            <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    {products.length} {products.length === 1 ? 'item' : 'items'} found
                </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
                    >
                        {products.map(product => {
                            const cartItem = cartItemsMap.get(product.id);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    cartItem={cartItem}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    onUpdateQuantity={handleUpdateQuantity}
                                />
                            );
                        })}
                    </motion.div>

                    {/* Loading indicator */}
                    {productsLoading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}

                    {/* Infinite scroll sentinel */}
                    {hasMore && products.length > 0 && (
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                            {productsLoading && (
                                <p className="text-gray-500 text-sm">Loading more products...</p>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center mb-4">
                        <SearchIcon />
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">No Products Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Try adjusting your search terms.' : 'No new arrivals or limited editions available at the moment. Check back soon!'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default NewArrivalsPage;
