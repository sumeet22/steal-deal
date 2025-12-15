import React, { useState, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { HomeIcon, ShoppingCartIcon, SunIcon, MoonIcon, ClipboardListIcon, LoadingSpinner, UserCircleIcon, HeartIcon } from './components/Icons';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';
import useLocalStorage from './hooks/useLocalStorage';
import UserMenu from './components/UserMenu';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NoInternetScreen from './components/NoInternetScreen';

// Lazy-loaded components
const Storefront = React.lazy(() => import('./components/Storefront'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const Checkout = React.lazy(() => import('./components/Checkout'));
const OrderHistory = React.lazy(() => import('./components/OrderHistory'));
const ProductDetail = React.lazy(() => import('./components/ProductDetail'));
const WishlistPage = React.lazy(() => import('./components/WishlistPage'));
const NewArrivalsPage = React.lazy(() => import('./components/NewArrivalsPage'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const SearchOverlay = React.lazy(() => import('./components/SearchOverlay'));
const TermsAndConditions = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.TermsAndConditions })));
const PrivacyPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.PrivacyPolicy })));
const ReturnsPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.ReturnsPolicy })));
const ShippingPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.ShippingPolicy })));

import { MenuIcon, SearchIcon, ShieldCheckIcon, CreditCardIcon, TruckIcon } from './components/Icons';

// Separate component for wishlist button to use the hook safely
const WishlistButton: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { wishlist } = useWishlist();
  const wishlistItemCount = wishlist.length;

  return (
    <div className="relative">
      <button onClick={onNavigate} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-pink-500" aria-label="Wishlist">
        <div className="relative">
          <HeartIcon filled={wishlistItemCount > 0} />
          {wishlistItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
              {wishlistItemCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};


type View = 'store' | 'checkout' | 'orders' | 'admin' | 'product' | 'auth' | 'wishlist' | 'newarrivals' | 'terms' | 'privacy' | 'returns' | 'shipping';

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [view, setView] = useState<View>('store');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const { cart, products, currentUser, setCurrentUser } = useAppContext();

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleProductClick = (productId: string) => {
    navigate('product', productId);
  };

  const mainStoreScrollPos = React.useRef(0); // Scroll position of the main category list
  const categoryScrollPos = React.useRef(0);  // Scroll position of the product list within a category

  const navigate = (newView: View, productId?: string, categoryId?: string | null) => {

    // 1. Going from Root Store (No Category) -> Category View
    if (view === 'store' && !selectedCategory && newView === 'store' && categoryId) {
      mainStoreScrollPos.current = window.scrollY;
    }

    // 2. Going from Store (Any) -> Product Detail
    if (view === 'store' && newView === 'product') {
      categoryScrollPos.current = window.scrollY;
    }

    setView(newView);

    // Handle Product ID
    if (productId) {
      setSelectedProductId(productId);
    } else if (newView !== 'product') {
      setSelectedProductId(null);
    }

    // Handle Category ID
    if (categoryId !== undefined) {
      setSelectedCategory(categoryId);
    }

    const params = new URLSearchParams();
    params.set('view', newView);
    if (productId) {
      params.set('productId', productId);
    }
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else if (selectedCategory && categoryId === undefined && newView === 'store') {
      // Persist existing category if not explicitly changed/cleared
      params.set('categoryId', selectedCategory);
    }

    // If we are explicitly clearing category (categoryId === null), we don't set it.

    window.history.pushState({}, '', `?${params.toString()}`);

    // Scroll Handling Logic

    // Case A: Back from Product -> Store (handled by Storefront component on mount via initialScroll prop)
    if (view === 'product' && newView === 'store') {
      // Do nothing here, let Component handle it
    }

    // Case C: New Navigation (Scroll to Top)
    // 1. Changing Category (categoryId passed and is not null)
    // 2. Going to Product (newView === 'product')
    // 3. Changing major views (Store -> Checkout, etc.)
    else if (categoryId || (newView === 'product') || newView !== view) {
      // Reset scroll positions if we are navigating to a fresh view
      if (categoryId) categoryScrollPos.current = 0;

      window.scrollTo(0, 0);
    }
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const parseUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as View | null;
      const productIdParam = params.get('productId');
      if (viewParam) {
        setView(viewParam);
        if (viewParam === 'product' && productIdParam) {
          setSelectedProductId(productIdParam);
        } else {
          setSelectedProductId(null);
        }

        const categoryParam = params.get('categoryId');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        } else {
          setSelectedCategory(null);
        }
      }
    };
    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // When user logs out, redirect to auth view if they were in a restricted area
  useEffect(() => {
    if (!currentUser && (view === 'admin' || view === 'orders' || view === 'checkout')) {
      navigate('auth');
    }
    // If currentUser exists and they are on the auth view, redirect them to store
    if (currentUser && view === 'auth') {
      navigate('store');
    }
  }, [currentUser, view]);

  useEffect(() => {
    const baseTitle = 'Steal Deal';
    switch (view) {
      case 'store':
        document.title = baseTitle;
        break;
      case 'product':
        const product = products.find(p => p.id === selectedProductId);
        document.title = product ? `${product.name} | ${baseTitle}` : baseTitle;
        break;
      case 'checkout':
        document.title = `Checkout | ${baseTitle}`;
        break;
      case 'orders':
        document.title = `My Orders | ${baseTitle}`;
        break;
      case 'admin':
        document.title = `Admin Dashboard | ${baseTitle}`;
        break;
      case 'auth':
        document.title = `Authentication | ${baseTitle}`;
        break;
      default:
        document.title = baseTitle;
    }
  }, [view, selectedProductId, products]);

  const renderView = () => {
    switch (view) {
      case 'store':
        return <Storefront
          onProductClick={handleProductClick}
          activeCategoryId={selectedCategory}
          onCategorySelect={(id) => navigate('store', undefined, id)}
          initialScroll={selectedCategory ? categoryScrollPos.current : mainStoreScrollPos.current}
          onNavigateToNewArrivals={() => navigate('newarrivals')}
        />;
      case 'product':
        return <ProductDetail productId={selectedProductId!} onBack={() => navigate('store')} />;
      case 'checkout':
        return <Checkout onBackToStore={() => navigate('store')} />;
      case 'orders':
        return <OrderHistory />;
      case 'wishlist':
        return <WishlistPage onProductClick={handleProductClick} />;
      case 'newarrivals':
        return <NewArrivalsPage onProductClick={handleProductClick} onBack={() => navigate('store', undefined, null)} />;
      case 'admin':
        return <AdminDashboard />;
      case 'auth':
        return authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        );
      case 'terms':
        return <TermsAndConditions />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'returns':
        return <ReturnsPolicy />;
      case 'shipping':
        return <ShippingPolicy />;
      default:
        return (
          <Storefront
            onProductClick={handleProductClick}
            activeCategoryId={selectedCategory}
            onCategorySelect={(id) => navigate('store', undefined, id)}
            initialScroll={selectedCategory ? categoryScrollPos.current : mainStoreScrollPos.current}
            onNavigateToNewArrivals={() => navigate('newarrivals')}
          />
        );
    }
  };

  if (!isOnline) {
    return <NoInternetScreen />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" role="navigation">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left: Menu */}
            <div className="flex items-center justify-start z-10">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Open menu">
                <MenuIcon />
              </button>
            </div>

            {/* Center: Logo (Absolute) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-bold text-xl cursor-pointer pointer-events-auto" onClick={() => { navigate('store', undefined, null); window.scrollTo(0, 0); }}>
                <img src="/logo.jpg" className="h-16 sm:h-12 w-auto mix-blend-screen rounded-lg" alt="Steal Deal" width="64" height="64" loading="eager" />
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 z-10">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" aria-label="Search products">
                <SearchIcon />
              </button>

              <WishlistButton onNavigate={() => navigate('wishlist')} />

              <div className="relative">
                <button onClick={() => setIsCartOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" aria-label="Cart">
                  <div className="relative">
                    <ShoppingCartIcon />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Trusted By / Features */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="text-indigo-500" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <TruckIcon className="text-indigo-500" />
                <span className="text-sm font-medium">Fast Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCardIcon className="text-indigo-500" />
                <span className="text-sm font-medium">Trusted Sellers</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right text-sm text-gray-500">
              <p>&copy; StealDeal2025. All rights reserved.</p>
            </div>

          </div>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { navigate('checkout'); setIsCartOpen(false); }} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(view) => {
          if (view === 'auth') {
            setAuthView('login');
          }
          navigate(view);
        }}
      />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(term) => {
          setGlobalSearchTerm(term);
          navigate('store');
          setIsSearchOpen(false);
        }}
        onProductClick={(productId) => {
          navigate('product', productId);
          setIsSearchOpen(false);
        }}
      />
    </div >
  );
};

const AppWrapper: React.FC = () => (
  <ToastProvider>
    <HelmetProvider>
      <AppProvider>
        <WishlistProviderWrapper />
      </AppProvider>
    </HelmetProvider>
  </ToastProvider>
);

const WishlistProviderWrapper: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <WishlistProvider currentUserId={currentUser?.id}>
      <App />
      <ToastContainer />
    </WishlistProvider>
  );
};

export default AppWrapper;