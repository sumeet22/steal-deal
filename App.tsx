import React, { useState, Suspense, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { HomeIcon, ShoppingCartIcon, SunIcon, MoonIcon, ClipboardListIcon, LoadingSpinner, UserCircleIcon } from './components/Icons';
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


type View = 'store' | 'checkout' | 'orders' | 'admin' | 'product' | 'auth';

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [view, setView] = useState<View>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const { cart, products, currentUser, setCurrentUser } = useAppContext();

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleProductClick = (productId: string) => {
    navigate('product', productId);
  };

  const navigate = (newView: View, productId?: string) => {
    setView(newView);
    if (productId) {
      setSelectedProductId(productId);
    } else if (newView !== 'product') {
      setSelectedProductId(null);
    }
    const params = new URLSearchParams();
    params.set('view', newView);
    if (productId) {
      params.set('productId', productId);
    }
    window.history.pushState({}, '', `?${params.toString()}`);
    window.scrollTo(0, 0);
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
        return <Storefront onProductClick={handleProductClick} />;
      case 'product':
        return <ProductDetail productId={selectedProductId!} onBack={() => navigate('store')} />;
      case 'checkout':
        return <Checkout onBackToStore={() => navigate('store')} />;
      case 'orders':
        return <OrderHistory />;
      case 'admin':
        return <AdminDashboard />;
      case 'auth':
        return authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        );
      default:
        return <Storefront onProductClick={handleProductClick} />;
    }
  };

  if (!isOnline) {
    return <NoInternetScreen />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" role="navigation">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl cursor-pointer" onClick={() => navigate('store')}>
                <img src="https://thestealdeal.com/web/image/website/1/logo/Steal%20Deal?unique=d646fd0.jpg" className="h-12 w-auto" alt="Steal Deal" />
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={() => navigate('store')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Home"><HomeIcon /></button>

              {currentUser?.role === 'user' && (
                <button onClick={() => navigate('orders')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Order History"><ClipboardListIcon /></button>
              )}

              {currentUser?.role === 'admin' && (
                <button onClick={() => navigate('admin')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Admin Dashboard"><UserCircleIcon /></button>
              )}

              <UserMenu onNavigateToAuth={(authView) => { setAuthView(authView); navigate('auth'); }} />



              <div className="relative">
                <button onClick={() => setIsCartOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Cart">
                  <ShoppingCartIcon />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-800">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
          <div className="animate-fade-in">
            {renderView()}
          </div>
        </Suspense>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { navigate('checkout'); setIsCartOpen(false); }} />
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <ToastProvider>
    <AppProvider>
      <App />
      <ToastContainer />
    </AppProvider>
  </ToastProvider>
);

export default AppWrapper;