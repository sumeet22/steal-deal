import React, { useState } from 'react';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import CsvUpload from './admin/CsvUpload';
import DataManagement from './admin/DataManagement';
import UserManagement from './admin/UserManagement';

type AdminView = 'products' | 'categories' | 'orders' | 'users' | 'csv-upload' | 'data-management';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<AdminView>('products');

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
      default:
        return <ProductManagement />;
    }
  };
  
  const getTabClass = (tabName: AdminView) => {
    return `px-3 py-2 font-semibold text-sm rounded-md focus:outline-none transition-colors duration-200 ${
      view === tabName
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
        </nav>
      </div>

      <div className="mt-6">
        {renderView()}
      </div>
    </div>
  );
};

export default AdminDashboard;