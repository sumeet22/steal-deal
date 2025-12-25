import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useWishlist } from '../context/WishlistContext';
import { useAppContext } from '../context/AppContext';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from './Icons';
import { Product } from '../types';

interface WishlistPageProps {
    onProductClick: (productId: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ onProductClick }) => {
    const { wishlist, wishlistProducts, removeFromWishlist, clearWishlist, wishlistLoading } = useWishlist();
    const { addToCart, products } = useAppContext();

    // Get full product objects from wishlist IDs
    // This is needed for guest users who only have IDs in localStorage
    const displayProducts = React.useMemo(() => {
        if (wishlistProducts.length > 0) {
            return wishlistProducts;
        }
        // Fallback: get products from AppContext using wishlist IDs
        return wishlist
            .map(id => products.find(p => p.id === id))
            .filter((p): p is Product => p !== undefined);
    }, [wishlist, wishlistProducts, products]);

    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
    };

    const handleMoveAllToCart = () => {
        displayProducts.forEach(product => {
            if (product && !product.outOfStock && product.stockQuantity > 0) {
                addToCart(product, 1);
            }
        });
    };

    if (wishlistLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (displayProducts.length === 0) {
        return (
            <>
                <Helmet>
                    <title>My Wishlist | Steal Deal</title>
                    <meta name="description" content="Your wishlist is empty. Start adding products you love!" />
                </Helmet>
                <div className="text-center py-16">
                    <div className="mb-6">
                        <HeartIcon className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your Wishlist is Empty</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Start adding products you love by clicking the heart icon!
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>{`My Wishlist (${displayProducts.length}) | Steal Deal`}</title>
                <meta name="description" content={`You have ${displayProducts.length} items in your wishlist`} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <HeartIcon filled className="text-pink-500 w-8 h-8" />
                            My Wishlist
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'} saved for later
                        </p>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleMoveAllToCart}
                            className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <ShoppingCartIcon className="w-5 h-5" />
                            Add All
                        </button>
                        <button
                            onClick={clearWishlist}
                            className="flex-1 sm:flex-none justify-center bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 text-red-500 font-bold py-2.5 px-6 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex items-center gap-2"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {displayProducts.map((product) => {
                        if (!product) return null;

                        const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
                        const imageUrl = mainImage?.url || product.image || 'https://placehold.co/400x400?text=No+Image';
                        const isOutOfStock = product.outOfStock || product.stockQuantity <= 0;

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 group relative border border-gray-100 dark:border-gray-800 hover:-translate-y-1"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWishlist(product.id);
                                    }}
                                    className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                                    title="Remove from wishlist"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>

                                {/* Product Image */}
                                <div
                                    className="relative aspect-square overflow-hidden cursor-pointer rounded-t-2xl bg-gray-50 dark:bg-gray-800"
                                    onClick={() => onProductClick(product.id)}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm tracking-wider shadow-lg transform -rotate-3">
                                                OUT OF STOCK
                                            </span>
                                        </div>
                                    )}
                                    {product.tags?.includes('sale') && !isOutOfStock && (
                                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                            SALE
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3
                                            className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 mb-1"
                                            onClick={() => onProductClick(product.id)}
                                        >
                                            {product.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                ₹{product.price.toFixed(2)}
                                            </span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{product.originalPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        disabled={isOutOfStock}
                                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-black dark:hover:bg-gray-100 hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default WishlistPage;
