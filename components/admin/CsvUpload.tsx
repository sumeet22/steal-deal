import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

const CsvUpload: React.FC = () => {
  const { addProduct, categories } = useAppContext();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const headers = "name,price,description,stockQuantity,categoryName,image\n";
    const exampleRow1 = "Sample Figure,99.99,A cool sample figure,50,Anime Figures,https://example.com/image.png\n";
    const exampleRow2 = "Sample Keychain,9.99,A sample keychain,200,Anime Keychains,https://example.com/image2.png\n";
    const csvContent = headers + exampleRow1 + exampleRow2;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sample_products.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const handleUpload = () => {
    if (!file) {
      // FIX: Add title to showToast call.
      showToast('Error', 'Please select a file to upload.', 'error');
      return;
    }
    if (isUploading) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parseCSV = (input: string) => {
            const rows: string[][] = [];
            let cur: string[] = [];
            let curField = '';
            let inQuotes = false;
            for (let i = 0; i < input.length; i++) {
              const ch = input[i];
              if (ch === '"') {
                if (inQuotes && input[i + 1] === '"') {
                  curField += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (ch === ',' && !inQuotes) {
                cur.push(curField);
                curField = '';
              } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (ch === '\r' && input[i + 1] === '\n') {
                  i++;
                }
                cur.push(curField);
                rows.push(cur);
                cur = [];
                curField = '';
              } else {
                curField += ch;
              }
            }
            if (curField !== '' || cur.length > 0) {
              cur.push(curField);
              rows.push(cur);
            }
            return rows.map(r => r.map(f => f.trim()));
          };

          const rawRows = parseCSV(text).filter(r => r.join('').trim() !== '');
          if (rawRows.length === 0) throw new Error('CSV file is empty or has no data rows.');
          const headers = rawRows[0].map(h => h.trim());
          const headersLower = headers.map(h => h.toLowerCase());
          const productsToAdd: Omit<Product, 'id'>[] = [];

          const requiredHeaders = ['name', 'price', 'description', 'stockquantity', 'categoryname'];
          if (!requiredHeaders.every(h => headersLower.includes(h))) {
            throw new Error(`CSV must contain at least the following headers: ${requiredHeaders.join(', ')}`);
          }

          const productsAddedMap = new Map<string, number>();

          for (let i = 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            const productData: { [key: string]: string } = {};
            headers.forEach((header, index) => {
              productData[header.toLowerCase()] = row[index]?.trim() || '';
            });

            const categoryName = productData['categoryname'];
            const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
            if (!category) {
              console.warn(`Category "${categoryName}" not found for product "${productData['name']}". Skipping.`);
              continue;
            }

            const price = parseFloat(productData['price']) || 0;
            const stock = parseInt(productData['stockquantity'], 10) || 0;

            productsToAdd.push({
              name: productData['name'] || '',
              price,
              description: productData['description'] || '',
              stockQuantity: stock,
              categoryId: category.id,
              image: productData['image'] || '',
            });
            productsAddedMap.set(category.name, (productsAddedMap.get(category.name) || 0) + 1);
          }

          for (const p of productsToAdd) {
            try {
              addProduct(p);
            } catch (e) {
              console.error('Failed to add product', p, e);
            }
          }

          let summary = `${productsToAdd.length} products processed. `;
          if (productsAddedMap.size > 0) {
            summary += 'Breakdown: ' + Array.from(productsAddedMap.entries()).map(([cat, count]) => `${count} in ${cat}`).join(', ');
          }
          // FIX: Add title to showToast call.
          showToast('Success', summary, 'success');

        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during CSV processing.";
            // FIX: Add title to showToast call.
            showToast('Error', `Error processing CSV: ${errorMessage}`, 'error');
        } finally {
            setIsUploading(false);
            setFile(null);
            if (document.getElementById('csv-upload-input')) {
                (document.getElementById('csv-upload-input') as HTMLInputElement).value = '';
            }
        }
      }
    };

    reader.onerror = () => {
        // FIX: Add title to showToast call.
        showToast('Error', 'Failed to read the file.', 'error');
        setIsUploading(false);
    }
    
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Bulk Upload Products via CSV</h2>
      <div className="mb-4 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">
            Upload a CSV file with the headers: <strong>name, price, description, stockQuantity, categoryName, image</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"> The `categoryName` must match an existing category exactly. The `image` header is optional.</p>
          <button onClick={handleDownloadSample} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Download Sample CSV</button>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="file"
          id="csv-upload-input"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            dark:file:bg-indigo-900 dark:file:text-indigo-300
            hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
        />
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default CsvUpload;