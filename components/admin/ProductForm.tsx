import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductImage } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { XIcon, PlusIcon, TrashIcon, CameraIcon, ImageIcon, LinkIcon, StarIcon } from '../Icons';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

type ImageSource = 'url' | 'camera' | 'gallery';

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { categories, addProduct, updateProduct } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    stockQuantity: '',
    categoryId: '',
    isNew: false,
    outOfStock: false,
    isNewArrival: false,
    isLimitedEdition: false,
    viewCount: '',
    addToCartCount: '',
    soldLast24Hours: '',
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSource>('url');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        description: product.description,
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.categoryId,
        isNew: product.tags?.includes('new') || false,
        outOfStock: product.outOfStock || false,
        isNewArrival: product.isNewArrival || false,
        isLimitedEdition: product.isLimitedEdition || false,
        viewCount: product.viewCount?.toString() || '',
        addToCartCount: product.addToCartCount?.toString() || '',
        soldLast24Hours: product.soldLast24Hours?.toString() || '',
      });

      // Load images from the new images array or fallback to legacy image field
      if (product.images && product.images.length > 0) {
        setImages([...product.images].sort((a, b) => a.order - b.order));
      } else if (product.image) {
        // Convert legacy single image to new format
        setImages([{ url: product.image, order: 0, isMain: true }]);
      } else {
        setImages([]);
      }
    } else {
      setFormData({
        name: '', price: '', originalPrice: '', description: '', stockQuantity: '', categoryId: categories[0]?.id || '', isNew: false, outOfStock: false,
        isNewArrival: false, isLimitedEdition: false,
        viewCount: '', addToCartCount: '', soldLast24Hours: '',
      });
      setImages([]);
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddImage = () => {
    if (images.length >= 5) {
      alert('Maximum 5 images allowed per product');
      return;
    }
    setShowImageModal(true);
  };

  const handleImageUrlSubmit = () => {
    if (!newImageUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }

    const newImage: ProductImage = {
      url: newImageUrl.trim(),
      order: images.length,
      isMain: images.length === 0, // First image is main by default
    };

    setImages([...images, newImage]);
    setNewImageUrl('');
    setShowImageModal(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Convert to base64 for preview (in production, you'd upload to a server)
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage: ProductImage = {
        url: reader.result as string,
        order: images.length,
        isMain: images.length === 0,
      };
      setImages([...images, newImage]);
      setShowImageModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      order: i,
      isMain: i === 0 ? true : img.isMain && index !== 0 ? img.isMain : false,
    }));
    setImages(reorderedImages);
  };

  const handleSetMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(updatedImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedImages = [...images];
    const draggedImage = updatedImages[draggedIndex];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, draggedImage);

    // Update order values
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      order: i,
    }));

    setImages(reorderedImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    const tags: ('new' | 'sale')[] = [];
    if (formData.isNew) tags.push('new');
    if (formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price)) {
      tags.push('sale');
    }

    // Get the main image or first image for backward compatibility
    const mainImage = images.find(img => img.isMain) || images[0];

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      categoryId: formData.categoryId,
      image: mainImage.url, // For backward compatibility
      images: images,
      tags: tags,
      outOfStock: formData.outOfStock,
      isNewArrival: formData.isNewArrival,
      isLimitedEdition: formData.isLimitedEdition,
      viewCount: formData.viewCount ? parseInt(formData.viewCount, 10) : undefined,
      addToCartCount: formData.addToCartCount ? parseInt(formData.addToCartCount, 10) : undefined,
      soldLast24Hours: formData.soldLast24Hours ? parseInt(formData.soldLast24Hours, 10) : undefined,
    };

    if (product) {
      updateProduct({ ...product, ...productData });
    } else {
      addProduct(productData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Product Images (Max 5)</label>
              <button
                type="button"
                onClick={handleAddImage}
                disabled={images.length >= 5}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <PlusIcon /> Add Image
              </button>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all ${image.isMain ? 'border-yellow-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'
                      } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <StarIcon /> Main
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!image.isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(index)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-full shadow-lg"
                          title="Set as main image"
                        >
                          <StarIcon />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg"
                        title="Remove image"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No images added yet. Click "Add Image" to get started.</p>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">Price (Sale)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">Original Price</label>
              <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} step="0.01" placeholder="e.g., 199.99" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input type="number" name="stockQuantity" id="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium mb-1">Category</label>
              <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="viewCount" className="block text-sm font-medium mb-1">View Count (Optional)</label>
              <input type="number" name="viewCount" id="viewCount" value={formData.viewCount} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="addToCartCount" className="block text-sm font-medium mb-1">Add to Cart Count (Optional)</label>
              <input type="number" name="addToCartCount" id="addToCartCount" value={formData.addToCartCount} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="soldLast24Hours" className="block text-sm font-medium mb-1">Sold Last 24 Hours (Optional)</label>
              <input type="number" name="soldLast24Hours" id="soldLast24Hours" value={formData.soldLast24Hours} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isNew" id="isNew" checked={formData.isNew} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="isNew" className="text-sm font-medium">Mark as 'New' product</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="outOfStock" id="outOfStock" checked={formData.outOfStock} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <label htmlFor="outOfStock" className="text-sm font-medium">Mark as 'Out of Stock' (prevents adding to cart)</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isNewArrival" id="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <label htmlFor="isNewArrival" className="text-sm font-medium">Show in 'New Arrivals' page</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isLimitedEdition" id="isLimitedEdition" checked={formData.isLimitedEdition} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
            <label htmlFor="isLimitedEdition" className="text-sm font-medium">Mark as 'Limited Edition'</label>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save Product</button>
          </div>
        </form>
      </div>

      {/* Image Source Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Image</h3>
              <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${imageSource === 'url' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <LinkIcon /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('gallery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${imageSource === 'gallery' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <ImageIcon /> Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('camera')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${imageSource === 'camera' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <CameraIcon /> Camera
                </button>
              </div>

              {imageSource === 'url' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleImageUrlSubmit}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Add Image
                  </button>
                </div>
              )}

              {imageSource === 'gallery' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ImageIcon /> Choose from Gallery
                  </button>
                </div>
              )}

              {imageSource === 'camera' && (
                <div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <CameraIcon /> Take Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
