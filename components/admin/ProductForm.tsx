import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { XIcon } from '../Icons';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { categories, addProduct, updateProduct } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    stockQuantity: '',
    categoryId: '',
    image: '',
    isNew: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        description: product.description,
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.categoryId,
        image: product.image || '',
        isNew: product.tags?.includes('new') || false,
      });
    } else {
      setFormData({
        name: '', price: '', originalPrice: '', description: '', stockQuantity: '', categoryId: categories[0]?.id || '', image: '', isNew: false,
      });
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData({ ...formData, [name]: checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags: ('new' | 'sale')[] = [];
    if (formData.isNew) tags.push('new');
    if (formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price)) {
      tags.push('sale');
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      categoryId: formData.categoryId,
      image: formData.image,
      tags: tags,
    };

    if (product) {
      updateProduct({ ...product, ...productData });
    } else {
      addProduct(productData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose}><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">Price (Sale)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">Original Price</label>
              <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} step="0.01" placeholder="e.g., 199.99" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input type="number" name="stockQuantity" id="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium mb-1">Category</label>
            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
           <div className="flex items-center gap-2">
              <input type="checkbox" name="isNew" id="isNew" checked={formData.isNew} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="isNew" className="text-sm font-medium">Mark as 'New' product</label>
            </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
          </div>
           <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">Image URL</label>
            <input type="text" name="image" id="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.png" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
