import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, EyeIcon, FireIcon, LoadingSpinner } from './Icons';
import { Product, ProductImage } from '../types';
import QuantityStepper from './shared/QuantityStepper';
import PullToRefresh from './shared/PullToRefresh';
import ComingSoon from './ComingSoon';

interface StorefrontProps {
  onProductClick: (productId: string) => void;
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  initialScroll?: number;
  onNavigateToNewArrivals?: () => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
};


interface ProductCardProps {
  product: Product;
  cartItem: { id: string; quantity: number } | undefined;
  onProductClick: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

// Helper function to get sorted images with fallback to legacy image field
const getProductImages = (product: Product): string[] => {
  if (product.images && product.images.length > 0) {
    // Sort by isMain first (main image first), then by order
    return [...product.images]
      .sort((a, b) => {
        // Main image always comes first
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        // If both or neither are main, sort by order
        return a.order - b.order;
      })
      .map(img => img.url);
  } else if (product.image) {
    return [product.image];
  }
  return [];
};

// Memoized ProductCard to prevent unnecessary re-renders
export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  cartItem,
  onProductClick,
  onAddToCart,
  onUpdateQuantity
}) => {
  const { getDisplayPrice } = useAppContext();
  const isInCart = !!cartItem;

  // Use cart quantity if in cart
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const isSale = product.originalPrice && product.originalPrice > product.price;
  const isNew = product.tags?.includes('new');
  const discount = isSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const productImages = useMemo(() => getProductImages(product), [product]);
  const hasMultipleImages = productImages.length > 1;

  const stats = useMemo(() => {
    return {
      viewCount: (product.viewCount && product.viewCount > 0) ? product.viewCount : Math.floor(Math.random() * (45 - 10 + 1)) + 10,
      soldLast24Hours: (product.soldLast24Hours && product.soldLast24Hours > 0) ? product.soldLast24Hours : Math.floor(Math.random() * (12 - 2 + 1)) + 2
    };
  }, [product.viewCount, product.soldLast24Hours]);

  // Auto-cycle images if multiple images exist
  React.useEffect(() => {
    if (hasMultipleImages && !isHovering) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 5000); // Change image every 5 seconds for smoother experience
      return () => clearInterval(interval);
    }
  }, [hasMultipleImages, productImages.length, isHovering]);

  // Sync local quantity with cart quantity when cart changes
  React.useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    // Always add quantity of 1 when clicking ADD TO CART
    onAddToCart(product);

    // Show success feedback
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }, 500);
  };

  // Handle quantity change - update cart directly since item is already in cart
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onUpdateQuantity(product.id, newQuantity);
  };

  const currentImage = productImages[currentImageIndex];

  return (
    <motion.div
      variants={itemVariants}
      className="product-card bg-white dark:bg-slate-900 rounded-3xl shadow-premium overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-premium-hover border border-slate-100 dark:border-slate-800 hover:border-brand-500/30"
    >
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() => onProductClick(product.id)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="h-48 sm:h-56 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
          {currentImage ? (
            <>
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentImageIndex}
                  src={currentImage}
                  alt={product.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </AnimatePresence>

              {/* Image dots indicator - only show if multiple images */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2 py-1 rounded-full">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 hover:bg-white/75'
                        }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">No Image</span>
          )}

        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && <span className="badge-animate text-[10px] font-black tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-lg uppercase">NEW</span>}
          {isSale && <span className="badge-animate text-[10px] font-black tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-lg uppercase">-{discount}%</span>}
        </div>
        <AnimatePresence>
          {isInCart && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="absolute top-3 right-3 bg-brand-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg uppercase tracking-widest z-10"
            >
              IN CART
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-brand-500 transition-colors" onClick={() => onProductClick(product.id)}>{product.name}</h3>

        <div className="flex items-baseline gap-2 mt-auto">
          <p className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-400">₹{getDisplayPrice(product.price).toFixed(2)}</p>
          {isSale && <p className="text-sm font-medium text-slate-400 line-through">₹{getDisplayPrice(product.originalPrice!).toFixed(2)}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1"><EyeIcon /><span>{stats.viewCount} viewing</span></div>
          <div className="flex items-center gap-1 text-red-500"><FireIcon /><span>{stats.soldLast24Hours} sold today</span></div>
        </div>
      </div>

      <div className="mt-auto p-3 pt-0 space-y-2">
        {(product.stockQuantity > 0 && !product.outOfStock) ? (
          <>
            {/* Show ONLY quantity stepper if item is in cart */}
            {isInCart ? (
              <div className="flex items-center justify-center gap-2 quantity-stepper">
                <QuantityStepper
                  quantity={quantity}
                  setQuantity={handleQuantityChange}
                  maxQuantity={product.stockQuantity}
                  compact
                />
              </div>
            ) : (
              /* Show ONLY add to cart button if item is NOT in cart */
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full font-black py-4 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all duration-500 relative overflow-hidden group/btn ${isAdding
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-wait'
                  : showSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-brand-500/25 hover:shadow-2xl active:scale-[0.98]'
                  }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAdding ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : showSuccess ? (
                    <>✓ Added</>
                  ) : (
                    'Add to Cart'
                  )}
                </span>
                {!isAdding && !showSuccess && (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                )}
              </button>
            )}
          </>
        ) : (
          <button
            className="w-full bg-gray-400 text-white font-bold py-2.5 px-4 rounded-lg cursor-not-allowed text-sm sm:text-base"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if product data or cart item changes
  const productChanged =
    prevProps.product.id !== nextProps.product.id ||
    prevProps.product.name !== nextProps.product.name ||
    prevProps.product.price !== nextProps.product.price ||
    prevProps.product.stockQuantity !== nextProps.product.stockQuantity;

  const cartItemChanged =
    prevProps.cartItem?.quantity !== nextProps.cartItem?.quantity ||
    !!prevProps.cartItem !== !!nextProps.cartItem;

  // Return true to SKIP re-render (props haven't changed)
  return !productChanged && !cartItemChanged;
});

ProductCard.displayName = 'ProductCard';

interface ProductGridProps {
  productsList: Product[];
  cartItemsMap: Map<string, { id: string; quantity: number }>;
  onProductClick: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = React.memo(({
  productsList,
  cartItemsMap,
  onProductClick,
  onAddToCart,
  onUpdateQuantity
}) => (
  <>
    <motion.div
      variants={containerVariants}
      initial="show"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
    >
      {productsList.map(product => {
        const cartItem = cartItemsMap.get(product.id);
        return (
          <ProductCard
            key={product.id}
            product={product}
            cartItem={cartItem}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
          />
        );
      })}

    </motion.div>
    {productsList.length === 0 && (
      <div className="text-center col-span-full py-12">
        <SearchIcon />
        <h3 className="text-xl font-medium mt-4">No Products Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or browse our categories.</p>
      </div>
    )}
  </>
));

ProductGrid.displayName = 'ProductGrid';

const Storefront: React.FC<StorefrontProps> = ({ 
  onProductClick, 
  activeCategoryId, 
  onCategorySelect, 
  initialScroll = 0, 
  onNavigateToNewArrivals,
  searchTerm: propsSearchTerm = '',
  onSearch: propsOnSearch
}) => {
  const { products, categories, cart, addToCart, updateCartQuantity, fetchProductsByCategory, fetchProductsBySearch, productsLoading, settingsLoaded } = useAppContext();

  // If settings haven't loaded yet, show a clean loading state to avoid price flicker
  if (!settingsLoaded && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner className="w-12 h-12 text-brand-600" />
        <p className="text-slate-400 font-medium animate-pulse italic uppercase tracking-widest text-xs">Syncing Premium Pricing...</p>
      </div>
    );
  }

  // Restore scroll position on mount
  React.useEffect(() => {
    if (initialScroll > 0) {
      window.scrollTo(0, initialScroll);
    }
  }, []); // Only runs on component mount

  // State for search and pagination
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const currentPageRef = React.useRef(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  // Fetch products when category changes
  React.useEffect(() => {
    if (activeCategoryId) {
      setCurrentPage(1);
      fetchProductsByCategory(activeCategoryId, 1, 20).then(result => {
        setHasMore(result.hasMore);
      });
    }
  }, [activeCategoryId, fetchProductsByCategory]);

  // Fetch products when global search changes (debounced)
  React.useEffect(() => {
    if (propsSearchTerm.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchProductsBySearch(propsSearchTerm, 1, 20).then(result => {
          setHasMore(result.hasMore);
        });
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [propsSearchTerm, fetchProductsBySearch]);

  // Category search is now client-side filtering (products already loaded for category)
  const categoryFilteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];

    // Filter by active category AND active status to prevent Admin-panel cache leaks
    const baseProducts = products.filter(p => p.categoryId === activeCategoryId && p.isActive !== false);

    if (!categorySearchTerm.trim()) {
      return baseProducts;
    }

    const term = categorySearchTerm.trim().toLowerCase();
    return baseProducts.filter(product =>
      (product.name || '').toLowerCase().includes(term)
    );
  }, [products, categorySearchTerm, activeCategoryId]);

  // Global search products (already loaded from API)
  const globalFilteredProducts = useMemo(() => {
    if (!propsSearchTerm.trim()) return [];
    // Only show active products
    return products.filter(p => p.isActive !== false);
  }, [products, propsSearchTerm]);

  // Create a memoized map of cart items by product ID to ensure stable references
  const cartItemsMap = useMemo(() => {
    const map = new Map<string, { id: string; quantity: number }>();
    cart.forEach(item => {
      map.set(item.id, { id: item.id, quantity: item.quantity });
    });
    return map;
  }, [cart]);

  const handleSelectCategory = (categoryId: string) => {
    onCategorySelect(categoryId);
    setCategorySearchTerm('');
    if (propsOnSearch) propsOnSearch(''); // Clear global search when selecting category
  };

  const handleBackToCategories = () => {
    onCategorySelect(null);
    setCategorySearchTerm('');
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    if (activeCategoryId) {
      // Refresh products in current category
      await fetchProductsByCategory(activeCategoryId, 1, 20).then(result => {
        setCurrentPage(1);
        setHasMore(result.hasMore);
      });
    } else if (propsSearchTerm) {
      // Refresh search results
      await fetchProductsBySearch(propsSearchTerm, 1, 20).then(result => {
        setCurrentPage(1);
        setHasMore(result.hasMore);
      });
    } else {
      // Refresh categories (reload page)
      window.location.reload();
    }
  }, [activeCategoryId, propsSearchTerm, fetchProductsByCategory, fetchProductsBySearch]);


  // Infinite scroll - load more when sentinel element is visible
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loadMoreRef.current || productsLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !productsLoading) {
          // Load next page
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);

          if (activeCategoryId) {
            fetchProductsByCategory(activeCategoryId, nextPage, 20).then(result => {
              setHasMore(result.hasMore);
            });
          } else if (propsSearchTerm) {
            fetchProductsBySearch(propsSearchTerm, nextPage, 20).then(result => {
              setHasMore(result.hasMore);
            });
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: '200px', // Start loading 200px before reaching the sentinel
        threshold: 0.1
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [activeCategoryId, propsSearchTerm, currentPage, hasMore, productsLoading, fetchProductsByCategory, fetchProductsBySearch]);


  // Memoized callbacks to prevent ProductCard re-renders
  const handleAddToCart = React.useCallback((product: Product) => {
    addToCart(product, 1);
  }, [addToCart]);

  const handleUpdateQuantity = React.useCallback((productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
  }, [updateCartQuantity]);

  // Wrap onProductClick to ensure it's stable
  const handleProductClick = React.useCallback((productId: string) => {
    onProductClick(productId);
  }, [onProductClick]);


  const renderCategoryView = () => {
    // Check if there are any active categories
    const activeCategories = categories.filter(cat => cat.isActive !== false);

    // Show Coming Soon page if no active categories
    if (activeCategories.length === 0) {
      return <ComingSoon />;
    }

    return (
      <div key="categories" className="space-y-10 pb-10">
        <Helmet>
          <title>Steal Deal | Premium Anime Merchandise</title>
          <meta name="description" content="Discover the best anime figures, keychains, and merchandise at unbeatable prices. Shop Naruto, One Piece, JJK, and more!" />
          <meta property="og:title" content="Steal Deal | Premium Anime Merchandise" />
          <meta property="og:description" content="Premium anime merchandise at unbeatable prices." />
        </Helmet>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative overflow-hidden rounded-[3rem] bg-slate-950 shadow-2xl min-h-[500px] flex items-center justify-center text-center px-4"
        >
          <div className="absolute inset-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

          {/* Advanced Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-900/40 via-transparent to-purple-900/40 opacity-60"></div>

          {/* Animated Background Blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-6">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-brand-200 text-xs font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-xl">
                <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
                The Premium Edition
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl leading-[0.9] tracking-tighter">
                DON'T JUST SHOP.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-fuchsia-400">EVOLVE.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
                Hand-picked elite collections. Authentic limited editions.<br />
                The wait is over for the collectors who care.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-5 justify-center mt-12"
            >
              <button
                onClick={() => document.getElementById('categories-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
              >
                <span className="relative z-10">Start Exploring</span>
                <div className="absolute inset-0 bg-brand-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
              <button
                onClick={() => onNavigateToNewArrivals?.()}
                className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-xl"
              >
                New Drops
              </button>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto w-full px-4 transform -translate-y-8">
          <div className="relative group">
            <input
              type="text"
              placeholder="Searching for something specific?"
              value={propsSearchTerm}
              onChange={(e) => propsOnSearch && propsOnSearch(e.target.value)}
              className="w-full p-5 pl-14 h-16 border-0 rounded-2xl bg-white dark:bg-slate-800 shadow-premium focus:ring-4 focus:ring-brand-500/20 outline-none transition-all text-lg font-medium"
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-500 group-focus-within:scale-110 transition-transform">
              <SearchIcon />
            </div>
            <div className="absolute right-4 inset-y-0 flex items-center">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">ENTER</span>
            </div>
          </div>
        </div>

        {propsSearchTerm ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Search Results</h2>
            <ProductGrid
              productsList={globalFilteredProducts}
              cartItemsMap={cartItemsMap}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
            />

            {/* Loading indicator */}
            {productsLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {hasMore && globalFilteredProducts.length > 0 && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {productsLoading && (
                  <p className="text-gray-500 text-sm">Loading more results...</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div id="categories-grid" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            {categories.filter(cat => cat.isActive !== false).length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
              >
                {categories.filter(cat => cat.isActive !== false).map(category => (
                  <motion.div
                    variants={itemVariants}
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-premium hover:shadow-premium-hover transition-all duration-700 h-80 sm:h-96 bg-slate-900"
                  >
                    <img
                      src={category.image || `https://placehold.co/600x400?text=${category.name}`}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full transform transition-all duration-500 group-hover:pb-12">
                      <h2 className="text-white text-2xl sm:text-4xl font-black italic tracking-tighter mb-3 uppercase leading-none">{category.name}</h2>
                      <div className="h-1 w-12 bg-brand-500 rounded-full group-hover:w-full transition-all duration-700"></div>
                      <p className="text-brand-200 text-[10px] font-black tracking-widest uppercase mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        Explore Collection
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xl text-gray-500 dark:text-gray-400">No categories found. Please check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProductView = () => (
    <div key={activeCategory?.id} className="space-y-8">
      <button onClick={handleBackToCategories} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
        <ChevronLeftIcon />
        All Categories
      </button>

      <div>
        <Helmet>
          <title>{activeCategory?.name} | Steal Deal</title>
          <meta name="description" content={`Shop the best ${activeCategory?.name} figures and merchandise.`} />
        </Helmet>
        <h1 className="text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          {activeCategory?.name}
        </h1>
      </div>

      <div className="relative flex-grow max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Search in this category..."
          value={categorySearchTerm}
          onChange={(e) => setCategorySearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border rounded-full bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <SearchIcon />
        </div>
      </div>

      <ProductGrid
        productsList={categoryFilteredProducts}
        cartItemsMap={cartItemsMap}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Loading indicator */}
      {productsLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && categoryFilteredProducts.length > 0 && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {productsLoading && (
            <p className="text-gray-500 text-sm">Loading more products...</p>
          )}
        </div>
      )}
    </div>
  );

  if (activeCategoryId) {
    // Show loading if we have an ID but categories haven't loaded yet
    if (categories.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    // If categories are loaded but ID matches nothing
    if (!activeCategory) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Category Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">The category you are looking for does not exist or has been removed.</p>
          <button
            onClick={handleBackToCategories}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors"
          >
            Return to Store
          </button>
        </div>
      );
    }

    return renderProductView();
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {renderCategoryView()}
    </PullToRefresh>
  );
};

export default Storefront;
