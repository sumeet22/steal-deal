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
    const { products, getDisplayPrice } = useAppContext();

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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 glass flex flex-col backdrop-blur-3xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
                        <button onClick={onClose} className="p-3 mr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-brand-500 hover:bg-brand-50 transition-all">
                            <XIcon className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                                placeholder="What are you looking for?"
                                className="w-full pl-4 pr-12 py-4 h-14 text-xl bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 font-bold tracking-tight"
                            />
                            <button onClick={handleSearchCommit} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-500 hover:scale-110 transition-transform">
                                <SearchIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full">
                        {searchTerm.trim() === '' ? (
                            <div className="text-center py-20">
                                <div className="p-10 inline-block rounded-full bg-slate-50 dark:bg-slate-800/50 mb-6 transition-all duration-700 hover:shadow-2xl">
                                    <SearchIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Discovery</h3>
                                <p className="text-slate-400 text-sm font-medium">Type to explore our premium collection.</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search Results</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">{searchResults.length} Products Found</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {searchResults.map(product => (
                                        <div key={product.id} onClick={() => {
                                            if (onProductClick) {
                                                onProductClick(product.id);
                                            } else {
                                                onSearch(product.name);
                                            }
                                            onClose();
                                        }} className="flex items-center gap-5 p-4 bg-white dark:bg-slate-800/40 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 hover:shadow-xl group cursor-pointer transition-all duration-500">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-500">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">{product.name}</h4>
                                                <p className="text-brand-600 dark:text-brand-400 font-black">₹{getDisplayPrice(product.price).toLocaleString()}</p>
                                                <div className="mt-1 h-0.5 w-0 bg-brand-500 group-hover:w-full transition-all duration-500"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="p-8 inline-block rounded-full bg-slate-50 dark:bg-slate-800/50 mb-6">
                                    <XIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Match</h3>
                                <p className="text-slate-400 text-sm font-medium">We couldn't find anything for "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
