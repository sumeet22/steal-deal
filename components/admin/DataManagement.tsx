import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Product, Category, Order } from '../../types';
import { DownloadIcon, UploadIcon } from '../Icons';

const DataManagement: React.FC = () => {
  const { products, categories, orders, setProducts, setCategories, setOrders } = useAppContext();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, restoreFunction: (file: File) => void) => {
    if (e.target.files && e.target.files[0]) {
      restoreFunction(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  };
  
  const downloadData = (data: any[], filename: string) => {
    if (data.length === 0) {
      // FIX: Add title to showToast call.
      showToast('Error', `No data available for ${filename}.`, 'error');
      return;
    }
    try {
      // Create a deep copy to avoid modifying original data
      const dataToProcess = JSON.parse(JSON.stringify(data));
      const headers = Object.keys(dataToProcess[0]);
      
      const csvRows = dataToProcess.map(row => {
        return headers.map(fieldName => {
          let value = row[fieldName];
          // If the value is an object or array, JSON.stringify it.
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          // Escape quotes by doubling them and wrap the whole field in quotes if it contains a comma, newline or quote.
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      });

      const csvContent = [headers.join(','), ...csvRows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // FIX: Add title to showToast call.
      showToast('Success', `${filename} downloaded successfully.`, 'success');
    } catch(error) {
        console.error("Download error:", error);
        // FIX: Add title to showToast call.
        showToast('Error', `Failed to generate download for ${filename}.`, 'error');
    }
  };

  const restoreFromFile = <T,>(
    file: File, 
    setter: React.Dispatch<React.SetStateAction<T[]>>, 
    typeName: string
  ) => {
    if (!window.confirm(`Are you sure you want to restore ${typeName}? This will overwrite all current ${typeName} data.`)) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Basic CSV parsing logic (can be improved with a library for more complex cases)
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("CSV file is empty or has no data rows.");
        
        const headers = lines[0].split(',').map(h => h.trim());
        const restoredData: T[] = lines.slice(1).map(line => {
            const values = line.split(','); // Simplified: doesn't handle commas within quoted fields
            const entry: {[key: string]: any} = {};
            headers.forEach((header, index) => {
                let value = values[index]?.trim();
                // Attempt to parse JSON strings for complex fields
                if (value?.startsWith('{') || value?.startsWith('[')) {
                    try {
                        entry[header] = JSON.parse(value);
                    } catch {
                        entry[header] = value;
                    }
                } else if (!isNaN(Number(value)) && value !== '') {
                    entry[header] = Number(value);
                } else {
                    entry[header] = value;
                }
            });
            return entry as T;
        });
        
        setter(restoredData);
        // FIX: Add title to showToast call.
        showToast('Success', `${typeName} restored successfully.`, 'success');
      } catch (error) {
        console.error("Restore error: ", error);
        const errorMessage = error instanceof Error ? error.message : "Check file format.";
        // FIX: Add title to showToast call.
        showToast('Error', `Failed to restore ${typeName}. ${errorMessage}`, 'error');
      }
    };
    reader.onerror = () => {
        // FIX: Add title to showToast call.
        showToast('Error', 'Failed to read the file.', 'error');
    }
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-8">
      {/* Backup Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Backup Data</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Download your store data as CSV files.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => downloadData(products, 'products_backup.csv')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <DownloadIcon /> Products
          </button>
          <button onClick={() => downloadData(categories, 'categories_backup.csv')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <DownloadIcon /> Categories
          </button>
           <button onClick={() => downloadData(orders, 'orders_backup.csv')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <DownloadIcon /> Orders
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Restore Data</h2>
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 dark:border-red-600 rounded-r-lg">
          <p className="font-semibold text-red-800 dark:text-red-200">Warning!</p>
          <p className="text-red-700 dark:text-red-300">Restoring data will overwrite existing data. This action cannot be undone. Please ensure you have a recent backup.</p>
        </div>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg dark:border-gray-700 gap-4">
                <label htmlFor="restore-products" className="font-medium">Restore Products</label>
                <input id="restore-products" type="file" accept=".csv" onChange={(e) => handleFileChange(e, (file) => restoreFromFile<Product>(file, setProducts, 'Products'))} className="hidden" />
                <label htmlFor="restore-products" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center transition-colors">
                    <UploadIcon /> Choose File
                </label>
            </div>
             <div className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg dark:border-gray-700 gap-4">
                <label htmlFor="restore-categories" className="font-medium">Restore Categories</label>
                <input id="restore-categories" type="file" accept=".csv" onChange={(e) => handleFileChange(e, (file) => restoreFromFile<Category>(file, setCategories, 'Categories'))} className="hidden" />
                <label htmlFor="restore-categories" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center transition-colors">
                    <UploadIcon /> Choose File
                </label>
            </div>
             <div className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg dark:border-gray-700 gap-4">
                <label htmlFor="restore-orders" className="font-medium">Restore Orders</label>
                <input id="restore-orders" type="file" accept=".csv" onChange={(e) => handleFileChange(e, (file) => restoreFromFile<Order>(file, setOrders, 'Orders'))} className="hidden" />
                <label htmlFor="restore-orders" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center transition-colors">
                    <UploadIcon /> Choose File
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;