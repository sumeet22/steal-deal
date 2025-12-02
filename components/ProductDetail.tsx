import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, EyeIcon, ShoppingBagIcon, FireIcon } from './Icons';
import QuantityStepper from './shared/QuantityStepper';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const { products, addToCart } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  
  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);

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
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-8">
      <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 hover:underline mb-6 flex items-center gap-1">
        <ChevronLeftIcon /> Back to products
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative bg-gray-200 dark:bg-gray-700 h-80 sm:h-96 rounded-lg flex items-center justify-center overflow-hidden group">
            {product.image ? (
              <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            ) : (
              <span className="text-gray-400">Product Image</span>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isNew && <span className="text-sm font-bold bg-teal-500 text-white px-3 py-1 rounded-full shadow-md">NEW</span>}
                {isSale && <span className="text-sm font-bold bg-red-500 text-white px-3 py-1 rounded-full shadow-md">-{discount}% OFF</span>}
            </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-3xl font-bold text-indigo-500 dark:text-indigo-400">${product.price.toFixed(2)}</p>
            {isSale && <p className="text-xl text-gray-500 line-through">${product.originalPrice!.toFixed(2)}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 border-t border-b py-3 dark:border-gray-700">
            {product.viewCount && <div className="flex items-center gap-1.5"><EyeIcon /><span><strong>{product.viewCount}</strong> people are viewing</span></div>}
            {product.addToCartCount && <div className="flex items-center gap-1.5"><ShoppingBagIcon /><span>Added to cart <strong>{product.addToCartCount}</strong> times</span></div>}
            {product.soldLast24Hours && <div className="flex items-center gap-1.5 text-red-500"><FireIcon /><span><strong>{product.soldLast24Hours}</strong> sold in last 24 hours</span></div>}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold">Quantity:</span>
            <QuantityStepper 
                quantity={quantity}
                setQuantity={setQuantity}
                maxQuantity={product.stockQuantity}
            />
          </div>
          <span className="text-sm text-gray-500 mb-6">{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}</span>

          <button
            onClick={handleAddToCart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={product.stockQuantity <= 0}
          >
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
