import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, HomeIcon, UserCircleIcon, ClipboardListIcon, LogoutIcon, ChevronDownIcon, SparklesIcon, DocumentTextIcon, ShieldCheckIcon, RefreshIcon, TruckIcon } from './Icons';
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
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);

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
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex-1 mr-4">
                                {currentUser ? (
                                    <button
                                        onClick={() => handleNavigation('profile')}
                                        className="w-full text-left group"
                                    >
                                        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                                                {currentUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            {/* User Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h2 className="text-base font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                    {currentUser.name}
                                                </h2>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity leading-tight mt-0.5">
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
                                        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            {/* Avatar Placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            {/* Guest Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h2 className="text-base font-bold mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                    Welcome, Guest
                                                </h2>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-tight">
                                                    Login / Register →
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 -mr-2 text-gray-500 dark:text-gray-400">
                                <XIcon />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-2">
                            <nav className="space-y-0.5 px-3">
                                <button onClick={() => handleNavigation('store')} className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                    <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        <HomeIcon />
                                    </div>
                                    <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Home</span>
                                </button>

                                {categories.filter(cat => cat.isActive !== false).length > 0 && (
                                    <button onClick={() => handleNavigation('newarrivals')} className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                        <div className="w-6 h-6 flex items-center justify-center text-purple-500">
                                            <SparklesIcon />
                                        </div>
                                        <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">New Arrivals</span>
                                    </button>
                                )}

                                {/* Categories Section */}
                                {categories.filter(cat => cat.isActive !== false).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            aria-expanded={isCategoriesOpen}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                </div>
                                                <span className="ml-3 font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    Categories ({categories.filter(cat => cat.isActive !== false).length})
                                                </span>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-gray-400"
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
                                                    <div className="pb-2">
                                                        {categories.filter(cat => cat.isActive !== false).map((category) => (
                                                            <button
                                                                key={category.id}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    onNavigate('store', undefined, category.id);
                                                                    onClose();
                                                                }}
                                                                className="w-full flex items-center px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors group ml-2 border-l-2 border-transparent hover:border-indigo-500"
                                                            >
                                                                {category.image && (
                                                                    <img
                                                                        src={category.image}
                                                                        alt=""
                                                                        className="w-6 h-6 rounded-md object-cover mr-3 pointer-events-none"
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pointer-events-none capitalize">
                                                                    {category.name}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {currentUser && currentUser.role === 'admin' && (
                                    <button onClick={() => handleNavigation('admin')} className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                        <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <UserCircleIcon />
                                        </div>
                                        <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Admin Dashboard</span>
                                    </button>
                                )}

                                {!currentUser && (
                                    <button onClick={() => handleNavigation('auth')} className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                        <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <UserCircleIcon />
                                        </div>
                                        <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Login / Register</span>
                                    </button>
                                )}

                                {/* Help & Support Section */}
                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => setIsHelpOpen(!isHelpOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        aria-expanded={isHelpOpen}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="ml-3 font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Help & Support
                                            </span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isHelpOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-gray-400"
                                        >
                                            <ChevronDownIcon />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isHelpOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-2">
                                                    {[
                                                        { label: 'Terms & Conditions', action: 'terms', icon: DocumentTextIcon },
                                                        { label: 'Privacy Policy', action: 'privacy', icon: ShieldCheckIcon },
                                                        { label: 'Returns Policy', action: 'returns', icon: RefreshIcon },
                                                        { label: 'Shipping Policy', action: 'shipping', icon: TruckIcon }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.action}
                                                            onClick={() => handleNavigation(item.action)}
                                                            className="w-full flex items-center px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors group ml-2 border-l-2 border-transparent hover:border-indigo-500"
                                                        >
                                                            <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                <item.icon />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {item.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </nav>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                            {currentUser && (
                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group">
                                    <div className="w-6 h-6 flex items-center justify-center mr-3">
                                        <LogoutIcon />
                                    </div>
                                    <span className="font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Logout</span>
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
