import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, HomeIcon, UserCircleIcon, ClipboardListIcon, LogoutIcon, ChevronDownIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
    const { currentUser, logout, cart } = useAppContext();
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handleNavigation = (view: string) => {
        onNavigate(view);
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
                            <div>
                                {currentUser ? (
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Hello, {currentUser.name}</h2>
                                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Welcome</h2>
                                        <p className="text-sm text-gray-500" onClick={() => handleNavigation('auth')}>Login / Register</p>
                                    </div>
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

                                {currentUser && (
                                    <>
                                        <button onClick={() => handleNavigation('orders')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <ClipboardListIcon />
                                            <span className="ml-4 font-medium">Order History</span>
                                        </button>

                                        {currentUser.role === 'admin' && (
                                            <button onClick={() => handleNavigation('admin')} className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <UserCircleIcon />
                                                <span className="ml-4 font-medium">Admin Dashboard</span>
                                            </button>
                                        )}
                                    </>
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
