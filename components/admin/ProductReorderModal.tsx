import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { XIcon } from '../Icons';

interface ProductReorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    categoryId: string;
    categoryName: string;
    onReorder: (productIds: string[], categoryId: string) => void;
}

const ProductReorderModal: React.FC<ProductReorderModalProps> = ({
    isOpen,
    onClose,
    products,
    categoryId,
    categoryName,
    onReorder,
}) => {
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        // Sort products by categoryOrder when modal opens
        const sorted = [...products].sort((a, b) => (a.categoryOrder || 0) - (b.categoryOrder || 0));
        setLocalProducts(sorted);
    }, [products, isOpen]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...localProducts];
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(dropIndex, 0, draggedItem);

        setLocalProducts(reordered);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleSave = () => {
        const productIds = localProducts.map(p => p.id);
        onReorder(productIds, categoryId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Reorder Products in {categoryName}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        💡 Tip: Drag and drop products to reorder them within this category
                    </div>

                    <div className="space-y-3">
                        {localProducts.map((product, index) => (
                            <div
                                key={product.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`p-4 border rounded-lg dark:border-gray-700 flex items-center gap-4 transition-all cursor-move ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                    } ${dragOverIndex === index && draggedIndex !== index
                                        ? 'border-indigo-500 border-2 bg-indigo-50 dark:bg-indigo-900/20'
                                        : ''
                                    } hover:border-indigo-300 dark:hover:border-indigo-600`}
                            >
                                {/* Drag Handle */}
                                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                                    </svg>
                                </div>

                                {/* Product Image */}
                                <img
                                    src={product.image || product.images?.[0]?.url || 'https://placehold.co/60x60?text=?'}
                                    alt={product.name}
                                    className="w-16 h-16 rounded object-cover bg-gray-200 dark:bg-gray-700"
                                />

                                {/* Product Info */}
                                <div className="flex-1">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{product.price.toFixed(2)}</p>
                                </div>

                                {/* Order Number */}
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Save Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductReorderModal;
