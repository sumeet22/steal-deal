import React, { useState, Suspense, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
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
const OrderTracking = React.lazy(() => import('./components/OrderTracking'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const SearchOverlay = React.lazy(() => import('./components/SearchOverlay'));
const TermsAndConditions = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.TermsAndConditions })));
const PrivacyPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.PrivacyPolicy })));
const ReturnsPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.ReturnsPolicy })));
const ShippingPolicy = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.ShippingPolicy })));
const ContactUs = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.ContactUs })));
const UserProfile = React.lazy(() => import('./components/UserProfile'));
const PaymentVerification = React.lazy(() => import('./components/PaymentVerification'));

import { MenuIcon, SearchIcon, ShieldCheckIcon, CreditCardIcon, TruckIcon } from './components/Icons';

// Separate component for wishlist button to use the hook safely
const WishlistButton: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { wishlist } = useWishlist();
  const wishlistItemCount = wishlist.length;

  return (
    <div className="relative">
      <button onClick={onNavigate} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-500" aria-label="Wishlist">
        <div className="relative">
          <HeartIcon filled={wishlistItemCount > 0} />
          {wishlistItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
              {wishlistItemCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};


type View = 'store' | 'checkout' | 'orders' | 'admin' | 'product' | 'auth' | 'wishlist' | 'newarrivals' | 'terms' | 'privacy' | 'returns' | 'shipping' | 'contact' | 'profile' | 'payment-verification' | 'order-tracking';

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

  const { cart, products, categories, currentUser, setCurrentUser } = useAppContext();

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleProductClick = (productId: string) => {
    navigate('product', productId);
  };

  const mainStoreScrollPos = React.useRef(0); // Scroll position of the main category list
  const categoryScrollPos = React.useRef(0);  // Scroll position of the product list within a category

  const navigate = (newView: View, productId?: string, categoryId?: string | null, replaceHistory = false) => {
    // Determine if we are already at this destination to prevent redundant history entries
    if (!replaceHistory) {
      const currentParams = new URLSearchParams(window.location.search);
      const isSameView = (currentParams.get('view') || 'store') === newView;
      const isSameProd = (currentParams.get('productId') || undefined) === productId;
      const isSameCat = (currentParams.get('categoryId') || null) === (categoryId === undefined ? selectedCategory : categoryId);

      if (isSameView && isSameProd && isSameCat) {
        replaceHistory = true;
      }
    }

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

    // Final category to set in URL
    const finalCat = categoryId !== undefined ? categoryId : (newView === 'store' ? selectedCategory : null);
    if (finalCat) {
      params.set('categoryId', finalCat);
    }

    const newUrl = `?${params.toString()}`;
    if (replaceHistory) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }

    // Scroll Handling Logic
    if (view === 'product' && newView === 'store') {
      // Do nothing, Component handles it
    }
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
      const viewParam = (params.get('view') as View | null) || 'store';
      const productIdParam = params.get('productId');
      const categoryParam = params.get('categoryId');
      const path = window.location.pathname;

      if (path === '/payment-success' || path === '/payment-failure' || path === '/payment-verification') {
        setView('payment-verification');
        return;
      }

      setView(viewParam);
      setSelectedProductId(productIdParam);
      setSelectedCategory(categoryParam);

      // If we are tracking, we might have orderId in url
      const orderIdParam = params.get('orderId');
      if (orderIdParam && viewParam === 'order-tracking') {
        // We can just let the component handle it or set a separate state
      }
    };
    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // When user logs out, redirect to auth view if they were in a restricted area
  useEffect(() => {
    if (!currentUser && (view === 'admin' || view === 'orders')) {
      navigate('auth', undefined, undefined, true);
    }
    // If currentUser exists and they are on the auth view, redirect them to store
    if (currentUser && view === 'auth') {
      navigate('store', undefined, undefined, true);
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
      case 'profile':
        document.title = `My Profile | ${baseTitle}`;
        break;
      case 'auth':
        document.title = `Authentication | ${baseTitle}`;
        break;
      case 'contact':
        document.title = `Contact Us | ${baseTitle}`;
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
          searchTerm={globalSearchTerm}
          onSearch={setGlobalSearchTerm}
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
      case 'profile':
        return <UserProfile onNavigate={navigate} />;
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
      case 'contact':
        return <ContactUs />;
      case 'payment-verification':
        return <PaymentVerification onBackToStore={() => navigate('store')} />;
      case 'order-tracking':
        const urlParams = new URLSearchParams(window.location.search);
        return <OrderTracking orderIdFromUrl={urlParams.get('orderId')} />;
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

  const activeProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  const activeCategoryName = selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : null;

  const getPageMeta = () => {
    const base = {
      title: 'Steal Deal - Best Anime & RC Merch',
      desc: 'Shop the best deals on anime figures, RC cars & unique collectibles.'
    };

    if (view === 'product' && activeProduct) {
      return {
        title: `${activeProduct.name} | Steal Deal`,
        desc: activeProduct.description.substring(0, 160)
      };
    }
    if (selectedCategory && activeCategoryName) {
      return {
        title: `${activeCategoryName} Collections | Steal Deal`,
        desc: `Explore our collection of ${activeCategoryName}. Best prices on Steal Deal.`
      };
    }
    return base;
  };

  const { title, desc } = getPageMeta();

  return (
    <div className="bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        {activeProduct?.image && <meta property="og:image" content={activeProduct.image} />}
      </Helmet>
      <header className="glass sticky top-0 z-40 transition-all duration-300">
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
              <span
                className="cursor-pointer pointer-events-auto flex items-center"
                onClick={() => navigate('store', undefined, null)}
              >
                <img
                  src="/logo_transparent.png"
                  className="h-10 sm:h-12 w-auto transition-all duration-500 hover:scale-110 logo-img"
                  alt="Steal Deal"
                  loading="eager"
                />
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 z-10">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" aria-label="Search products">
                <SearchIcon />
              </button>

              <WishlistButton onNavigate={() => navigate('wishlist')} />

              <div className="relative">
                <button onClick={() => setIsCartOpen(true)} className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-500 dark:text-brand-400 group transition-all" aria-label="Cart">
                  <div className="relative group-hover:scale-110 transition-transform">
                    <ShoppingCartIcon />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800 animate-bounce-in">
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

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
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
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-30"></div>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">

            {/* Trusted By / Features */}
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Our Guarantee</h4>
              <div className="flex flex-col items-center md:items-start space-y-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheckIcon />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Secure Payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <TruckIcon />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Fast Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <CreditCardIcon />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Curated Deals</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><button onClick={() => navigate('privacy')} className="hover:text-brand-500 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('returns')} className="hover:text-brand-500 transition-colors">Refund & Cancellation</button></li>
                <li><button onClick={() => navigate('shipping')} className="hover:text-brand-500 transition-colors">Shipping Policy</button></li>
                <li><button onClick={() => navigate('terms')} className="hover:text-brand-500 transition-colors">Terms & Conditions</button></li>
                <li><button onClick={() => navigate('contact')} className="hover:text-brand-500 transition-colors">Contact Us</button></li>
              </ul>
            </div>

            {/* Copyright & Branding */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-black italic tracking-tighter text-brand-600 dark:text-brand-400">STEAL DEAL</h3>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  Premium Merchandise & Collectibles
                </p>
                <div className="pt-4">
                  <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                    &copy; 2025 ALL RIGHTS RESERVED.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { navigate('checkout'); setIsCartOpen(false); }} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(view, productId, categoryId) => {
          if (view === 'auth') {
            setAuthView('login');
          }
          navigate(view, productId, categoryId);
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