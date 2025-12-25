import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import { useWishlist } from '../context/WishlistContext';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon, EyeIcon, ShoppingBagIcon, FireIcon, HeartIcon } from './Icons';
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
  const { products, addToCart, cart, updateCartQuantity } = useAppContext();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to find product in products array first, then use fetched product
  const product = useMemo(() => {
    const foundProduct = products.find(p => p.id === productId);
    return foundProduct || fetchedProduct;
  }, [products, productId, fetchedProduct]);

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
          // Map the product data
          const categoryId = data.category && (typeof data.category === 'object'
            ? (data.category._id || data.category.id)
            : data.category);

          const mappedProduct: Product = {
            id: data._id || data.id,
            name: data.name,
            price: data.price,
            originalPrice: data.originalPrice ?? null,
            description: data.description || '',
            stockQuantity: data.stockQuantity ?? data.stock ?? 0,
            categoryId: categoryId || '',
            image: data.image || data.imageUrl || undefined,
            images: data.images || undefined,
            tags: data.tags || [],
            viewCount: data.viewCount ?? undefined,
            addToCartCount: data.addToCartCount ?? undefined,
            soldLast24Hours: data.soldLast24Hours ?? undefined,
            outOfStock: data.outOfStock ?? false,
          };

          setFetchedProduct(mappedProduct);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching product:', err);
          setError('Failed to load product');
          setLoading(false);
        });
    }
  }, [productId, products]);

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

      const categoryId = data.category && (typeof data.category === 'object'
        ? (data.category._id || data.category.id)
        : data.category);

      const mappedProduct: Product = {
        id: data._id || data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        description: data.description || '',
        stockQuantity: data.stockQuantity ?? data.stock ?? 0,
        categoryId: categoryId || '',
        image: data.image || data.imageUrl || undefined,
        images: data.images || undefined,
        tags: data.tags || [],
        viewCount: data.viewCount ?? undefined,
        addToCartCount: data.addToCartCount ?? undefined,
        soldLast24Hours: data.soldLast24Hours ?? undefined,
        outOfStock: data.outOfStock ?? false,
      };

      setFetchedProduct(mappedProduct);
    } catch (err) {
      console.error('Error refreshing product:', err);
      setError('Failed to refresh product');
    } finally {
      setLoading(false);
    }
  }, [productId]);


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
      <div className="max-w-7xl mx-auto animate-hero-fade-in pb-16 px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Images */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden group border border-gray-100 dark:border-gray-700">
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
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isNew && (
                      <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-black dark:bg-white dark:text-black rounded-full shadow-lg">
                        NEW
                      </span>
                    )}
                    {isSale && (
                      <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-red-600 rounded-full shadow-lg">
                        -{discount}%
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
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-200 border ${index === currentImageIndex
                      ? 'border-black dark:border-white ring-1 ring-black dark:ring-white scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200 dark:hover:border-gray-700'
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
          <div className="flex flex-col pt-2">

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <p className="text-3xl font-medium text-gray-900 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              {isSale && (
                <p className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Stats Bar (Recently Sold Badge) */}
            {(stats.viewCount > 20 || stats.soldLast24Hours > 5) && (
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {stats.soldLast24Hours > 0 && (
                  <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-100 dark:border-orange-900/30 animate-pulse-slow">
                    <FireIcon />
                    <span>{stats.soldLast24Hours} sold in last 24h</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <EyeIcon />
                  <span>{stats.viewCount} people viewing</span>
                </div>
              </div>
            )}

            {/* Transactional Area: Quantity & Add to Cart */}
            <div className="space-y-8 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
              {/* Quantity Helper */}
              {product.stockQuantity > 0 && !product.outOfStock ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center max-w-[200px]">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Quantity</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantityStepper
                      quantity={quantity}
                      setQuantity={setQuantity}
                      maxQuantity={product.stockQuantity}
                    />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      {itemInCart ? `In Cart: ${quantity}` : 'In Stock'}
                    </span>
                  </div>
                  {product.stockQuantity < 10 && (
                    <p className="text-xs text-red-500 font-medium">
                      Only {product.stockQuantity} left!
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 font-medium border border-red-100 dark:border-red-900/30">
                  Currently Out of Stock
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0 || product.outOfStock}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-full text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBagIcon />
                  {product.stockQuantity <= 0 || product.outOfStock
                    ? 'Out of Stock'
                    : itemInCart
                      ? 'Update Cart'
                      : 'Add to Cart'
                  }
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 rounded-full border transition-all duration-200 ${isInWishlist(product.id)
                    ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-900/20 dark:border-red-900 hover:bg-red-100'
                    : 'border-gray-200 hover:border-black dark:border-gray-700 dark:hover:border-white text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  aria-label="Add to wishlist"
                >
                  <HeartIcon filled={isInWishlist(product.id)} />
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
