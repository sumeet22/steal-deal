import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ShoppingCartIcon, PlusIcon, MinusIcon, EyeIcon, ShoppingBagIcon, FireIcon } from './Icons';
import QuantityStepper from './shared/QuantityStepper';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const { products, addToCart } = useAppContext();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);

  // Randomize stats if not provided
  const stats = useMemo(() => {
    if (!product) return { viewCount: 0, addToCartCount: 0, soldLast24Hours: 0 };
    return {
      viewCount: (product.viewCount && product.viewCount > 0) ? product.viewCount : Math.floor(Math.random() * (45 - 10 + 1)) + 10,
      addToCartCount: (product.addToCartCount && product.addToCartCount > 0) ? product.addToCartCount : Math.floor(Math.random() * (8 - 1 + 1)) + 1,
      soldLast24Hours: (product.soldLast24Hours && product.soldLast24Hours > 0) ? product.soldLast24Hours : Math.floor(Math.random() * (12 - 2 + 1)) + 2
    };
  }, [product]);

  if (!product) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
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

  return (
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
        {product.image && <meta property="og:image" content={product.image} />}
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm group">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
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
              <span className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} pieces available` : 'Out of stock'}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className="w-full sm:w-auto relative overflow-hidden group bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-[200px]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 z-10 transition-colors group-hover:text-white">
                <ShoppingCartIcon />
                {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
