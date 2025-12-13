import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import ProductForm from './ProductForm';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons';

const ProductManagement: React.FC = () => {
  const { products, deleteProduct, categories, fetchAllProductsForAdmin } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Fetch all products when component mounts (admin needs to see all products)
  useEffect(() => {
    fetchAllProductsForAdmin();
  }, [fetchAllProductsForAdmin]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlusIcon /> Add Product
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 hidden md:table-header-group">
            <tr>
              <th scope="col" className="py-3 px-6">Product</th>
              <th scope="col" className="py-3 px-6">Price</th>
              <th scope="col" className="py-3 px-6">Stock</th>
              <th scope="col" className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="grid md:table-row-group grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <tr key={product.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md md:shadow-none md:border-b md:table-row flex flex-col p-4 md:p-0">
                <td className="py-2 md:py-4 md:px-6 font-medium text-gray-900 dark:text-white flex justify-between items-center md:table-cell">
                  <span className="md:hidden text-xs uppercase text-gray-500 font-bold">Product</span>
                  <div className="flex items-center gap-3">
                    <img
                      src={(() => {
                        // Get main image or first image from images array, fallback to legacy image field
                        if (product.images && product.images.length > 0) {
                          const mainImage = product.images.find(img => img.isMain) || product.images[0];
                          return mainImage.url.replace('/products/', '/products_400/');
                        }
                        return (product.image ? product.image.replace('/products/', '/products_400/') : 'https://placehold.co/40x40?text=?');
                      })()}
                      alt={product.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="font-semibold">{product.name}</span>
                  </div>
                </td>
                <td className="py-2 md:py-4 md:px-6 flex justify-between items-center md:table-cell">
                  <span className="md:hidden text-xs uppercase text-gray-500 font-bold">Price</span>
                  <span>₹{product.price.toFixed(2)}</span>
                </td>
                <td className="py-2 md:py-4 md:px-6 flex justify-between items-center md:table-cell">
                  <span className="md:hidden text-xs uppercase text-gray-500 font-bold">Stock</span>
                  <span>{product.stockQuantity}</span>
                </td>
                <td className="py-2 md:py-4 md:px-6 md:text-right pt-4 mt-4 border-t md:border-0 dark:border-gray-700">
                  <div className="flex items-center space-x-2 justify-end">
                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Edit">
                      <PencilIcon />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Delete">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductForm product={editingProduct} onClose={closeModal} />
      )}
    </div>
  );
};

export default ProductManagement;