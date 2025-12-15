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

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HeartIcon filled className="text-pink-500" />
                            My Wishlist
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleMoveAllToCart}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <ShoppingCartIcon />
                            Add All to Cart
                        </button>
                        <button
                            onClick={clearWishlist}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <TrashIcon />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayProducts.map((product) => {
                        if (!product) return null;

                        const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
                        const imageUrl = mainImage?.url || product.image || 'https://placehold.co/400x400?text=No+Image';
                        const isOutOfStock = product.outOfStock || product.stockQuantity <= 0;

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group relative"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                    title="Remove from wishlist"
                                >
                                    <TrashIcon />
                                </button>

                                {/* Product Image */}
                                <div
                                    className="relative h-64 overflow-hidden cursor-pointer"
                                    onClick={() => onProductClick(product.id)}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                                                OUT OF STOCK
                                            </span>
                                        </div>
                                    )}
                                    {product.tags?.includes('sale') && !isOutOfStock && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            SALE
                                        </div>
                                    )}
                                    {product.tags?.includes('new') && !isOutOfStock && (
                                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            NEW
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3
                                        className="font-bold text-lg mb-2 text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                                        onClick={() => onProductClick(product.id)}
                                    >
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{product.price.toFixed(2)}
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-sm text-gray-500 line-through">
                                                ₹{product.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isOutOfStock}
                                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCartIcon />
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
