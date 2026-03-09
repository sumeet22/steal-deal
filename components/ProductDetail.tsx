import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import { useWishlist } from '../context/WishlistContext';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon, EyeIcon, ShoppingBagIcon, FireIcon, HeartIcon, LoadingSpinner } from './Icons';
import QuantityStepper from './shared/QuantityStepper';
import { Product, ProductImage } from '../types';
import PullToRefresh from './shared/PullToRefresh';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

// Helper function to get sorted images with fallback to legacy image field
const getProductImages = (product: Product): ProductImage[] => {
  if (product.images && product.images.length > 0) {
    // Sort by isMain first (main image first), then by order
    return [...product.images].sort((a, b) => {
      // Main image always comes first
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      // If both or neither are main, sort by order
      return a.order - b.order;
    });
  } else if (product.image) {
    // Fallback to legacy single image
    return [{ url: product.image, order: 0, isMain: true }];
  }
  return [];
};

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const { products, addToCart, cart, updateCartQuantity, getDisplayPrice, mapProductData, settingsLoaded } = useAppContext();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = useMemo(() => {
    const foundProduct = products.find(p => p.id === productId);
    return foundProduct || fetchedProduct;
  }, [products, productId, fetchedProduct]);

  // If settings haven't loaded yet, show a clean loading state to avoid price flicker
  if (!settingsLoaded && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner className="w-12 h-12 text-brand-600" />
        <p className="text-slate-400 font-medium animate-pulse italic uppercase tracking-widest text-xs">Loading Details...</p>
      </div>
    );
  }

  // Sync quantity with cart
  useEffect(() => {
    if (productId) {
      const cartItem = cart.find(item => item.id === productId);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [cart, productId]);

  const itemInCart = useMemo(() => {
    return cart.find(item => item.id === productId);
  }, [cart, productId]);

  // Fetch product from API if not found in products array
  useEffect(() => {
    const foundInProducts = products.find(p => p.id === productId);

    if (!foundInProducts && productId) {
      setLoading(true);
      setError(null);

      fetch(`/api/products/${productId}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then(data => {
          setFetchedProduct(mapProductData(data));
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching product:', err);
          setError('Failed to load product');
          setLoading(false);
        });
    }
  }, [productId, products, mapProductData]);

  const productImages = useMemo(() => product ? getProductImages(product) : [], [product]);

  // Randomize stats if not provided
  const stats = useMemo(() => {
    if (!product) return { viewCount: 0, addToCartCount: 0, soldLast24Hours: 0 };
    return {
      viewCount: (product.viewCount && product.viewCount > 0) ? product.viewCount : Math.floor(Math.random() * (45 - 10 + 1)) + 10,
      addToCartCount: (product.addToCartCount && product.addToCartCount > 0) ? product.addToCartCount : Math.floor(Math.random() * (8 - 1 + 1)) + 1,
      soldLast24Hours: (product.soldLast24Hours && product.soldLast24Hours > 0) ? product.soldLast24Hours : Math.floor(Math.random() * (12 - 2 + 1)) + 2
    };
  }, [product]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();

      setFetchedProduct(mapProductData(data));
    } catch (err) {
      console.error('Error refreshing product:', err);
      setError('Failed to refresh product');
    } finally {
      setLoading(false);
    }
  }, [productId, mapProductData]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h2>
        <button onClick={onBack} className="text-indigo-600 hover:underline flex items-center gap-1 mx-auto">
          <ChevronLeftIcon /> Back to store
        </button>
      </div>
    );
  }

  const isSale = product.originalPrice && product.originalPrice > product.price;
  const isNew = product.tags?.includes('new');
  const discount = isSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const handleAddToCart = () => {
    if (quantity > 0) {
      if (itemInCart) {
        updateCartQuantity(product.id, quantity);
      } else {
        addToCart(product, quantity);
      }
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const currentImage = productImages[currentImageIndex];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto animate-hero-fade-in pb-20 px-4 sm:px-6 lg:px-8">
        <Helmet>
          <title>{product.name} | Steal Deal</title>
          <meta name="description" content={product.description.substring(0, 160)} />
          <meta property="og:title" content={`${product.name} - ₹${product.price}`} />
          <meta property="og:description" content={product.description.substring(0, 200)} />
          {currentImage && <meta property="og:image" content={currentImage.url} />}
        </Helmet>

        {/* Clean Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6 lg:mb-10">
          <button
            onClick={onBack}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Store
          </button>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Images */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/5] sm:aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group border border-slate-100 dark:border-slate-800 shadow-premium">
              {currentImage ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                    style={{ touchAction: 'pinch-zoom', userSelect: 'none' }}
                  />

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {isNew && (
                      <span className="px-4 py-1.5 text-[10px] font-black tracking-widest text-white bg-emerald-500 rounded-full shadow-xl uppercase">
                        NEW ARRIVAL
                      </span>
                    )}
                    {isSale && (
                      <span className="px-4 py-1.5 text-[10px] font-black tracking-widest text-white bg-rose-600 rounded-full shadow-xl uppercase">
                        SPECIAL DEAL -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white p-3 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeftIcon />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white p-3 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRightIcon />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500 border-2 ${index === currentImageIndex
                      ? 'border-brand-500 scale-95 shadow-lg shadow-brand-500/20'
                      : 'border-transparent opacity-50 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-5 flex flex-col pt-2">

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-4xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
                ₹{getDisplayPrice(product.price).toLocaleString('en-IN')}
              </p>
              {isSale && (
                <p className="text-xl text-slate-400 line-through font-medium">
                  ₹{getDisplayPrice(product.originalPrice!).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Stats Bar (Recently Sold Badge) */}
            {(stats.viewCount > 20 || stats.soldLast24Hours > 5) && (
              <div className="flex flex-wrap items-center gap-4 mb-10">
                {stats.soldLast24Hours > 0 && (
                  <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100 dark:border-orange-500/20">
                    <FireIcon />
                    <span>{stats.soldLast24Hours} SOLD TODAY</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>{stats.viewCount} buyers are interested</span>
                </div>
              </div>
            )}

            {/* Transactional Area: Quantity & Add to Cart */}
            <div className="space-y-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
              {/* Quantity Helper */}
              {product.stockQuantity > 0 && !product.outOfStock ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center max-w-[240px]">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Select Quantity</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <QuantityStepper
                      quantity={quantity}
                      setQuantity={setQuantity}
                      maxQuantity={product.stockQuantity}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {itemInCart ? `${quantity} in your cart` : 'Available in stock'}
                      </span>
                    </div>
                  </div>
                  {product.stockQuantity < 10 && (
                    <p className="text-xs text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <FireIcon className="w-3 h-3" />
                      Hurry! Only {product.stockQuantity} left
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  Item currently unavailable
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0 || product.outOfStock}
                  className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 px-8 rounded-2xl text-base uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/atc relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-brand-500 translate-y-full group-hover/atc:translate-y-0 transition-transform duration-500"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    <ShoppingBagIcon />
                    {product.stockQuantity <= 0 || product.outOfStock
                      ? 'Unavailable'
                      : itemInCart
                        ? 'Update Quantity'
                        : 'Bag this Deal'
                    }
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 active:scale-90 ${isInWishlist(product.id)
                    ? 'border-rose-100 bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/20'
                    : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-500/20 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                    }`}
                  aria-label="Add to wishlist"
                >
                  <HeartIcon filled={isInWishlist(product.id)} className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Description Section (Rich Text) */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
              <div
                className="rich-text text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ProductDetail;
