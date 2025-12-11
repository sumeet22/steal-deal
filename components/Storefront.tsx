import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, EyeIcon, FireIcon } from './Icons';
import { Product } from '../types';
import QuantityStepper from './shared/QuantityStepper';

interface StorefrontProps {
  onProductClick: (productId: string) => void;
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  initialScroll?: number;
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

// Memoized ProductCard to prevent unnecessary re-renders
export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  cartItem,
  onProductClick,
  onAddToCart,
  onUpdateQuantity
}) => {
  const isInCart = !!cartItem;

  // Use cart quantity if in cart
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isSale = product.originalPrice && product.originalPrice > product.price;
  const isNew = product.tags?.includes('new');
  const discount = isSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const stats = useMemo(() => {
    return {
      viewCount: (product.viewCount && product.viewCount > 0) ? product.viewCount : Math.floor(Math.random() * (45 - 10 + 1)) + 10,
      soldLast24Hours: (product.soldLast24Hours && product.soldLast24Hours > 0) ? product.soldLast24Hours : Math.floor(Math.random() * (12 - 2 + 1)) + 2
    };
  }, [product.viewCount, product.soldLast24Hours]);

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

  return (
    <motion.div
      variants={itemVariants}
      className="product-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-indigo-500/30"
    >
      <div className="relative cursor-pointer" onClick={() => onProductClick(product.id)}>
        <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image.replace('/products/', '/products_400/')}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}

        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="badge-animate text-xs font-bold bg-teal-500 text-white px-2 py-1 rounded-full shadow-md">NEW</span>}
          {isSale && <span className="badge-animate text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full shadow-md">-{discount}%</span>}
        </div>
        {isInCart && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            In Cart
          </div>
        )}
        {showSuccess && !isInCart && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg success-feedback">
            ✓ Added!
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold truncate transition-colors group-hover:text-indigo-500 cursor-pointer" onClick={() => onProductClick(product.id)}>{product.name}</h3>

        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{product.price.toFixed(2)}</p>
          {isSale && <p className="text-md text-gray-500 line-through">₹{product.originalPrice!.toFixed(2)}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1"><EyeIcon /><span>{stats.viewCount} viewing</span></div>
          <div className="flex items-center gap-1 text-red-500"><FireIcon /><span>{stats.soldLast24Hours} sold today</span></div>
        </div>
      </div>

      <div className="mt-auto p-3 pt-0 space-y-2">
        {product.stockQuantity > 0 ? (
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
                className={`add-to-cart-btn w-full font-bold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300 shadow-md ${isAdding
                  ? 'bg-gray-400 cursor-wait'
                  : showSuccess
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                  } text-white`}
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="spinner h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : showSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    ✓ Added to Cart
                  </span>
                ) : (
                  'ADD TO CART'
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

const Storefront: React.FC<StorefrontProps> = ({ onProductClick, activeCategoryId, onCategorySelect, initialScroll = 0 }) => {
  const { products, categories, cart, addToCart, updateCartQuantity } = useAppContext();

  // Restore scroll position on mount
  React.useEffect(() => {
    if (initialScroll > 0) {
      window.scrollTo(0, initialScroll);
    }
  }, []); // Only runs on component mount

  // activeCategoryId is now a prop
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  const categoryFilteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];

    // First get all products in this category
    const categoryProducts = products.filter(p => p.categoryId === activeCategoryId);

    // If search term is empty, return all category products
    if (!categorySearchTerm.trim()) {
      return categoryProducts;
    }

    // Otherwise, filter by search term
    const term = categorySearchTerm.trim().toLowerCase();
    return categoryProducts.filter(product =>
      (product.name || '').toLowerCase().includes(term)
    );
  }, [products, categorySearchTerm, activeCategoryId]);

  const globalFilteredProducts = useMemo(() => {
    if (!globalSearchTerm) return [];
    return products.filter(product =>
      product.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [products, globalSearchTerm]);

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
  };

  const handleBackToCategories = () => {
    onCategorySelect(null);
    setCategorySearchTerm('');
  };

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



  const renderCategoryView = () => (
    <div key="categories" className="space-y-10 pb-10">
      <Helmet>
        <title>Steal Deal | Premium Anime Merchandise</title>
        <meta name="description" content="Discover the best anime figures, keychains, and merchandise at unbeatable prices. Shop Naruto, One Piece, JJK, and more!" />
        <meta property="og:title" content="Steal Deal | Premium Anime Merchandise" />
        <meta property="og:description" content="Premium anime merchandise at unbeatable prices." />
      </Helmet>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 shadow-2xl min-h-[400px] flex items-center justify-center text-center px-4"
      >
        <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Animated Background Blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 p-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-sm font-semibold mb-4 backdrop-blur-sm">
              ✨ Premium Collection
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 mb-2 drop-shadow-sm">
              Upgrade Your Collection
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-indigo-100/90 max-w-2xl mx-auto font-light leading-relaxed">
              Authentic figures, premium accessories, and exclusive merchandise from your favorite anime series.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <button
              onClick={() => document.getElementById('categories-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-xl hover:shadow-indigo-500/20"
            >
              Shop Now
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm">
              View New Arrivals
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div>
        <div className="relative flex-grow max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search all products..."
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-full bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
        </div>
      </div>

      {globalSearchTerm ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">Search Results</h2>
          <ProductGrid
            productsList={globalFilteredProducts}
            cartItemsMap={cartItemsMap}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      ) : (
        <div id="categories-grid" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          {categories.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categories.map(category => (
                <motion.div
                  variants={itemVariants}
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 h-80 sm:h-96"
                >
                  <img src={category.image || `https://placehold.co/600x400?text=${category.name}`} alt={category.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                    <h2 className="text-white text-3xl font-bold tracking-tight mb-2">{category.name}</h2>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full group-hover:w-24 transition-all duration-300"></div>
                    <p className="text-gray-300 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      Explore Collection →
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

  return renderCategoryView();
};

export default Storefront;
