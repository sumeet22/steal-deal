import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, HomeIcon, UserCircleIcon, ClipboardListIcon, LogoutIcon, ChevronDownIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: any, productId?: string, categoryId?: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
    const { currentUser, logout, cart, categories } = useAppContext();
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(true);

    const handleNavigation = (view: string, categoryId?: string) => {
        if (categoryId) {
            onNavigate('store', undefined, categoryId);
        } else {
            onNavigate(view);
        }
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        onNavigate('store'); // navigate home after logout
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white dark:bg-gray-900 z-50 shadow-xl flex flex-col"
                    >
                        {/* Header / User Info */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                            <div className="flex-1">
                                {currentUser ? (
                                    <button
                                        onClick={() => handleNavigation('profile')}
                                        className="w-full text-left group"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {currentUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-lg font-bold mb-0.5 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {currentUser.name}
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {currentUser.email}
                                                </p>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Profile →
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavigation('auth')}
                                        className="w-full text-left group"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            {/* Avatar Placeholder */}
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            {/* Guest Info */}
                                            <div className="flex-1">
                                                <h2 className="text-lg font-bold mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    Welcome, Guest
                                                </h2>
                                                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                                    Login / Register →
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <XIcon />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="space-y-1">
                                <button onClick={() => handleNavigation('store')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <HomeIcon />
                                    <span className="ml-4 font-medium">Home</span>
                                </button>

                                <button onClick={() => handleNavigation('newarrivals')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <SparklesIcon className="text-purple-500" />
                                    <span className="ml-4 font-medium">New Arrivals</span>
                                </button>

                                {/* Categories Section */}
                                <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className="w-full flex items-center justify-between px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        aria-expanded={isCategoriesOpen}
                                        aria-label="Toggle categories menu"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            <span className="ml-4 font-medium text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Categories ({categories.length})
                                            </span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDownIcon />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isCategoriesOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <nav className="py-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                                    {categories.length > 0 ? (
                                                        categories.map((category) => (
                                                            <button
                                                                key={category.id}
                                                                onClick={() => handleNavigation('store', category.id)}
                                                                className="w-full flex items-center px-6 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                                                                aria-label={`Browse ${category.name} category`}
                                                            >
                                                                {category.image && (
                                                                    <img
                                                                        src={category.image}
                                                                        alt=""
                                                                        className="w-8 h-8 rounded-md object-cover mr-3"
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {category.name}
                                                                </span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                            No categories available
                                                        </p>
                                                    )}
                                                </nav>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {currentUser && currentUser.role === 'admin' && (
                                    <button onClick={() => handleNavigation('admin')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <UserCircleIcon />
                                        <span className="ml-4 font-medium">Admin Dashboard</span>
                                    </button>
                                )}

                                {!currentUser && (
                                    <button onClick={() => handleNavigation('auth')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <UserCircleIcon />
                                        <span className="ml-4 font-medium">Login / Register</span>
                                    </button>
                                )}

                                <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                                    <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Help & Support</p>
                                    <button onClick={() => handleNavigation('terms')} className="w-full flex items-center px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
                                        <span className="ml-8">Terms & Conditions</span>
                                    </button>
                                    <button onClick={() => handleNavigation('privacy')} className="w-full flex items-center px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
                                        <span className="ml-8">Privacy Policy</span>
                                    </button>
                                    <button onClick={() => handleNavigation('returns')} className="w-full flex items-center px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
                                        <span className="ml-8">Returns Policy</span>
                                    </button>
                                    <button onClick={() => handleNavigation('shipping')} className="w-full flex items-center px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
                                        <span className="ml-8">Shipping Policy</span>
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                            {currentUser && (
                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <LogoutIcon />
                                    <span className="ml-4 font-medium">Logout</span>
                                </button>
                            )}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
