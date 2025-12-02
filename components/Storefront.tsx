import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, EyeIcon, FireIcon } from './Icons';
import { Product } from '../types';
import QuantityStepper from './shared/QuantityStepper';

interface StorefrontProps {
  onProductClick: (productId: string) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ onProductClick }) => {
  const { products, categories, addToCart } = useAppContext();
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

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setCategorySearchTerm('');
  };

  const handleBackToCategories = () => {
    setActiveCategoryId(null);
    setCategorySearchTerm('');
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const isSale = product.originalPrice && product.originalPrice > product.price;
    const isNew = product.tags?.includes('new');
    const discount = isSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
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
            {isNew && <span className="text-xs font-bold bg-teal-500 text-white px-2 py-1 rounded-full">NEW</span>}
            {isSale && <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full">-{discount}%</span>}
          </div>
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

        <div className="mt-auto p-3 pt-0">
          {product.stockQuantity > 0 ? (
            <div className="flex items-center gap-1">
                <QuantityStepper 
                    quantity={quantity} 
                    setQuantity={setQuantity} 
                    maxQuantity={product.stockQuantity}
                    compact
                />
                <button
                    onClick={() => addToCart(product, quantity)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded-lg text-sm transition-colors"
                >
                    Add
                </button>
            </div>
          ) : (
             <button
                className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
          )}
        </div>
      </div>
    );
  };
  
  const ProductGrid: React.FC<{productsList: Product[]}> = ({ productsList }) => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productsList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {productsList.length === 0 && (
          <div className="text-center col-span-full py-12">
              <SearchIcon />
              <h3 className="text-xl font-medium mt-4">No Products Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or browse our categories.</p>
          </div>
      )}
    </>
  );

  const renderCategoryView = () => (
    <div key="categories" className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-center mb-2">Explore Our Collections</h1>
        <p className="text-lg text-center text-gray-500 dark:text-gray-400 mb-8">Find what you're looking for or browse our categories.</p>
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
          <ProductGrid productsList={globalFilteredProducts} />
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

      <ProductGrid productsList={categoryFilteredProducts} />
    </div>
  );

  return activeCategoryId ? renderProductView() : renderCategoryView();
};

export default Storefront;
