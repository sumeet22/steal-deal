import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon, EyeIcon, ShoppingBagIcon, FireIcon } from './Icons';
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
    return [...product.images].sort((a, b) => a.order - b.order);
  } else if (product.image) {
    // Fallback to legacy single image
    return [{ url: product.image, order: 0, isMain: true }];
  }
  return [];
};

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const { products, addToCart } = useAppContext();
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
      addToCart(product, quantity);
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
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 transition-all duration-300">
        <button
          onClick={onBack}
          className="group text-indigo-600 dark:text-indigo-400 font-medium mb-8 flex items-center gap-2 hover:translate-x-[-4px] transition-transform duration-200"
        >
          <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <ChevronLeftIcon />
          </div>
          <span>Back to products</span>
        </button>

        <Helmet>
          <title>{product.name} | Steal Deal</title>
          <meta name="description" content={product.description.substring(0, 160)} />
          <meta property="og:title" content={`${product.name} - ₹${product.price}`} />
          <meta property="og:description" content={product.description.substring(0, 200)} />
          {currentImage && <meta property="og:image" content={currentImage.url} />}
        </Helmet>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Section with Carousel */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm group">
              {currentImage ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Navigation Arrows - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeftIcon />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRightIcon />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span className="text-gray-400 font-medium">No Image Available</span>
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-2.5">
                {isNew && (
                  <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-teal-500 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                    NEW
                  </span>
                )}
                {isSale && (
                  <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-red-500 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip - Only show if multiple images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                      ? 'border-indigo-500 scale-105 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.isMain && (
                      <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="w-20 h-1.5 bg-indigo-500 rounded-full"></div>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">
                ₹{product.price.toFixed(2)}
              </p>
              {isSale && (
                <div className="flex flex-col">
                  <p className="text-xl text-gray-400 font-medium line-through decoration-2 decoration-gray-400/50">
                    ₹{product.originalPrice!.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Stats Chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-800">
                <EyeIcon />
                <span>{stats.viewCount} viewing</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-100 dark:border-purple-800">
                <ShoppingBagIcon />
                <span>In {stats.addToCartCount} carts</span>
              </div>
              {(stats.soldLast24Hours > 0) && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium border border-orange-100 dark:border-orange-800 animate-pulse-slow">
                  <FireIcon />
                  <span>{stats.soldLast24Hours} sold recently</span>
                </div>
              )}
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed border-l-4 border-gray-200 dark:border-gray-700 pl-4 py-1">
              {product.description}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-gray-900 dark:text-white font-semibold text-lg">Quantity</span>
                <QuantityStepper
                  quantity={quantity}
                  setQuantity={setQuantity}
                  maxQuantity={product.stockQuantity}
                />
                <span className={`text-sm font-medium ${(product.stockQuantity > 0 && !product.outOfStock) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {(product.stockQuantity > 0 && !product.outOfStock) ? `${product.stockQuantity} pieces available` : 'Out of stock'}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0 || product.outOfStock}
                className="w-full sm:w-auto relative overflow-hidden group bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-[200px]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 z-10 transition-colors group-hover:text-white">
                  <ShoppingCartIcon />
                  {(product.stockQuantity <= 0 || product.outOfStock) ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ProductDetail;
