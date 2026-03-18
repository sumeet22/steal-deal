import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, XIcon, LoadingSpinner, TrashIcon, HistoryIcon } from './Icons';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (term: string) => void;
    onProductClick?: (productId: string) => void;
    initialTerm?: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch, onProductClick, initialTerm = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialTerm);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const { getDisplayPrice, mapProductData } = useAppContext();

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem('steal_deal_recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    useEffect(() => {
        setSearchTerm(initialTerm);
    }, [initialTerm, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    search: searchTerm.trim(),
                    limit: '10'
                });
                const res = await fetch(`/api/products?${params}`);
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();
                const mapped = (data.products || []).map(mapProductData);
                setSearchResults(mapped);
            } catch (err) {
                console.error('Search overlay error:', err);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isOpen, mapProductData]);

    const addToRecentSearches = (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        
        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('steal_deal_recent_searches', JSON.stringify(updated));
    };

    const handleSearchCommit = (term: string = searchTerm) => {
        const finalTerm = term.trim();
        if (finalTerm) {
            addToRecentSearches(finalTerm);
            onSearch(finalTerm);
            onClose();
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('steal_deal_recent_searches');
    };

    const removeRecentItem = (e: React.MouseEvent, termToRemove: string) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== termToRemove);
        setRecentSearches(updated);
        localStorage.setItem('steal_deal_recent_searches', JSON.stringify(updated));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] glass backdrop-blur-3xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
                        <button onClick={onClose} className="p-2 mr-4 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <XIcon className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                                placeholder="Search the premium vault..."
                                className="w-full h-12 text-xl bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 font-bold tracking-tight"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <LoadingSpinner className="w-12 h-12 text-brand-500 mb-4" />
                                <p className="text-slate-400 font-medium animate-pulse">Scanning inventory...</p>
                            </div>
                        ) : searchTerm.trim() === '' ? (
                            <div className="space-y-10">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                                <HistoryIcon className="w-3 h-3" /> Recent Searches
                                            </h3>
                                            <button 
                                                onClick={clearRecentSearches}
                                                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1"
                                            >
                                                <TrashIcon className="w-3 h-3" /> Clear All
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map((term, index) => (
                                                <div 
                                                    key={index}
                                                    onClick={() => {
                                                        setSearchTerm(term);
                                                        handleSearchCommit(term);
                                                    }}
                                                    className="group flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer hover:bg-brand-500 hover:text-white transition-all duration-300"
                                                >
                                                    <span className="text-sm font-semibold">{term}</span>
                                                    <button 
                                                        onClick={(e) => removeRecentItem(e, term)}
                                                        className="p-1 rounded-full opacity-50 group-hover:opacity-100 hover:bg-black/10 transition-all"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Quick Discoveries</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {['Anime Figures', 'RC Cars', 'Limited Edition', 'New Drops'].map((tag) => (
                                            <button 
                                                key={tag}
                                                onClick={() => {
                                                    setSearchTerm(tag);
                                                    handleSearchCommit(tag);
                                                }}
                                                className="p-4 text-center bg-white dark:bg-slate-800/40 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 hover:shadow-xl transition-all group"
                                            >
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-brand-500 transition-colors">{tag}</p>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search Results</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">{searchResults.length} Match Found</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {searchResults.map(product => (
                                        <div 
                                            key={product.id} 
                                            onClick={() => {
                                                addToRecentSearches(searchTerm);
                                                if (onProductClick) {
                                                    onProductClick(product.id);
                                                } else {
                                                    onSearch(product.name);
                                                    onClose();
                                                }
                                            }} 
                                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/40 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 hover:shadow-2xl group cursor-pointer transition-all duration-500"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                                                <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images.find(img => img.isMain)?.url || product.images[0].url : product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{product.name}</h4>
                                                <p className="text-brand-600 dark:text-brand-400 font-black text-sm">₹{getDisplayPrice(product.price).toLocaleString()}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-500">
                                                <SearchIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <div className="text-center py-20">
                                <div className="p-8 inline-block rounded-full bg-slate-50 dark:bg-slate-800/50 mb-6">
                                    <SearchIcon className="w-12 h-12 text-slate-200 dark:text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Match</h3>
                                <p className="text-slate-400 text-sm font-medium">No results found for "{searchTerm}". Try another query.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;


