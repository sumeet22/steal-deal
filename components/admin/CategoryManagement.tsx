import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Category } from '../../types';
import { PencilIcon, TrashIcon, XIcon } from '../Icons';

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      addCategory({ name: newCategory.name.trim(), image: newCategory.image.trim() });
      setNewCategory({ name: '', image: '' });
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory);
      setEditingCategory(null);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>

      <form onSubmit={handleAddCategory} className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
              placeholder="New category name"
              className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              value={newCategory.image}
              onChange={(e) => setNewCategory(prev => ({...prev, image: e.target.value}))}
              placeholder="Image URL (optional)"
              className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto"
        >
          Add Category
        </button>
      </form>

      <div className="space-y-3">
        {categories.map(category => (
          <div key={category.id} className="p-3 border rounded-lg dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
            {editingCategory?.id === category.id ? (
              <form onSubmit={handleUpdateCategory} className="flex-grow flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-grow w-full sm:w-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  autoFocus
                  required
                />
                 <input
                  type="text"
                  placeholder="Image URL"
                  value={editingCategory.image}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  className="flex-grow w-full sm:w-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg">Save</button>
                    <button type="button" onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700"><XIcon /></button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-4">
                    <img src={category.image || 'https://placehold.co/40x40?text=?'} alt={category.name} className="w-10 h-10 rounded object-cover bg-gray-200 dark:bg-gray-700"/>
                    <span>{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setEditingCategory(category)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Edit">
                        <PencilIcon />
                    </button>
                    <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Delete">
                        <TrashIcon />
                    </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;