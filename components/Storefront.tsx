import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, EyeIcon, FireIcon } from './Icons';
import { Product } from '../types';
import QuantityStepper from './shared/QuantityStepper';

interface StorefrontProps {
  onProductClick: (productId: string) => void;
}

interface ProductCardProps {
  product: Product;
  cartItem: { id: string; quantity: number } | undefined;
  onProductClick: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

// Memoized ProductCard to prevent unnecessary re-renders
const ProductCard: React.FC<ProductCardProps> = React.memo(({
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
    <div className="product-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
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
          <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</p>
          {isSale && <p className="text-md text-gray-500 line-through">${product.originalPrice!.toFixed(2)}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {product.viewCount && <div className="flex items-center gap-1"><EyeIcon /><span>{product.viewCount} viewing</span></div>}
          {product.soldLast24Hours && <div className="flex items-center gap-1 text-red-500"><FireIcon /><span>{product.soldLast24Hours} sold today</span></div>}
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
    </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
    </div>
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

const Storefront: React.FC<StorefrontProps> = ({ onProductClick }) => {
  const { products, categories, cart, addToCart, updateCartQuantity } = useAppContext();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  const categoryFilteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter(product => {
      const matchesCategory = product.categoryId === activeCategoryId;
      const matchesSearch = product.name.toLowerCase().includes(categorySearchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
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
    setActiveCategoryId(categoryId);
    setCategorySearchTerm('');
  };

  const handleBackToCategories = () => {
    setActiveCategoryId(null);
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
    <div key="categories" className="space-y-8">
      {/* Hero Section */}
      {/* <div className="hero-animate relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20 text-center">
          <div className="hero-float inline-block mb-4">
            <span className="text-5xl sm:text-6xl md:text-7xl">🎁</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Welcome to Steal Deal
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
            Discover amazing products at unbeatable prices. Your one-stop shop for everything!
          </p>
        </div>
      </div> */}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {categories.map(category => (
            <div key={category.id} onClick={() => handleSelectCategory(category.id)} className="group relative rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 h-80 hover:-translate-y-1">
              <img src={category.image || `https://placehold.co/600x400?text=${category.name}`} alt={category.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-white text-3xl font-bold tracking-wider">{category.name}</h2>
              </div>
            </div>
          ))}
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
        <h1 className="text-4xl font-extrabold text-center mb-2">{activeCategory?.name}</h1>
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

  return activeCategoryId ? renderProductView() : renderCategoryView();
};

export default Storefront;
