import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, XIcon, LoadingSpinner } from './Icons';
import { useAppContext } from '../context/AppContext';
import { ProductCard } from './Storefront'; // Assuming we can reuse or need to import types/component

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (term: string) => void;
    onProductClick?: (productId: string) => void;
    initialTerm?: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch, onProductClick, initialTerm = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialTerm);
    const { products } = useAppContext();

    // Basic search logic for immediate feedback (optional)
    // Or we just let the user hit Enter/Search icon to trigger the main search
    // The user requested "Click on search will show the screen attached in third"
    // Image 3 shows an input and a list of products (presumably results or recommendations)

    // Let's implement a live search within the overlay for better UX
    const searchResults = React.useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        ).slice(0, 10); // Limit to 10 results for overlay
    }, [searchTerm, products]);

    useEffect(() => {
        setSearchTerm(initialTerm);
    }, [initialTerm, isOpen]);

    const handleSearchCommit = () => {
        onSearch(searchTerm);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                        <button onClick={onClose} className="p-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <XIcon />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                                placeholder="Search for products"
                                className="w-full pl-2 pr-10 py-2 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                            />
                            <button onClick={handleSearchCommit} className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500">
                                <SearchIcon />
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {searchTerm.trim() === '' ? (
                            <div className="text-center text-gray-500 mt-10">
                                <p>Type to search...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {searchResults.map(product => (
                                    <div key={product.id} onClick={() => {
                                        if (onProductClick) {
                                            onProductClick(product.id);
                                        } else {
                                            onSearch(product.name);
                                        }
                                        onClose();
                                    }} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
                                            <p className="text-red-500 font-bold">₹{product.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 mt-10">
                                <p>No results found for "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
