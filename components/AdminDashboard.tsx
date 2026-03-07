import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import CsvUpload from './admin/CsvUpload';
import DataManagement from './admin/DataManagement';
import UserManagement from './admin/UserManagement';

type AdminView = 'products' | 'categories' | 'orders' | 'users' | 'csv-upload' | 'data-management' | 'price-settings';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<AdminView>('products');

  const { pricePercentage, setPricePercentage, getDisplayPrice } = useAppContext();

  const renderView = () => {
    switch (view) {
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'csv-upload':
        return <CsvUpload />;
      case 'data-management':
        return <DataManagement />;
      case 'price-settings':
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-indigo-50 dark:border-indigo-900/30">
            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Global Pricing Strategy</h2>
            <p className="text-gray-500 text-sm mb-8">Adjust the overall price hike multiplier for all products in the store.</p>

            <div className="max-w-md space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Hike Percentage (%)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="5"
                    value={pricePercentage}
                    onChange={(e) => setPricePercentage(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={pricePercentage}
                    onChange={(e) => setPricePercentage(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 p-3 bg-gray-50 dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl font-black text-center focus:ring-4 ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-xs font-black uppercase text-indigo-400 mb-4 tracking-widest">Live Example</h3>
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-indigo-50 dark:border-white/5">
                  <span className="text-sm font-medium text-gray-500">Base Price (DB)</span>
                  <span className="font-bold">₹1000.00</span>
                </div>
                <div className="my-2 flex justify-center text-indigo-400">
                  <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="flex justify-between items-center bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                  <span className="text-sm font-black uppercase">Store Display Price</span>
                  <span className="text-xl font-black">₹{getDisplayPrice(1000).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex gap-3 border border-amber-100 dark:border-amber-900/20">
                <span className="text-xl">💡</span>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Setting this to <strong>100%</strong> keeps original prices.
                  <strong> 200%</strong> doubles the price. This changes what customers see
                  and what they are billed immediately.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <ProductManagement />;
    }
  };

  const getTabClass = (tabName: AdminView) => {
    return `px-3 py-2 font-semibold text-sm rounded-md focus:outline-none transition-colors duration-200 ${view === tabName
      ? 'bg-indigo-600 text-white'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Tabs">
          <button onClick={() => setView('products')} className={getTabClass('products')}>
            Products
          </button>
          <button onClick={() => setView('categories')} className={getTabClass('categories')}>
            Categories
          </button>
          <button onClick={() => setView('orders')} className={getTabClass('orders')}>
            Orders
          </button>
          <button onClick={() => setView('users')} className={getTabClass('users')}>
            Users
          </button>
          <button onClick={() => setView('csv-upload')} className={getTabClass('csv-upload')}>
            Bulk Upload
          </button>
          <button onClick={() => setView('data-management')} className={getTabClass('data-management')}>
            Data Management
          </button>
          <button onClick={() => setView('price-settings')} className={getTabClass('price-settings')}>
            💰 Pricing
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {renderView()}
      </div>
    </div>
  );
};

export default AdminDashboard;