import { Product, ProductImage } from '../types';

/**
 * Get sorted product images with fallback to legacy image field
 * Returns an array of ProductImage objects sorted by order
 */
export const getProductImages = (product: Product): ProductImage[] => {
    if (product.images && product.images.length > 0) {
        return [...product.images].sort((a, b) => a.order - b.order);
    } else if (product.image) {
        // Fallback to legacy single image
        return [{ url: product.image, order: 0, isMain: true }];
    }
    return [];
};

/**
 * Get the main image URL for a product
 * Returns the URL of the main image, or the first image, or undefined
 */
export const getMainImageUrl = (product: Product): string | undefined => {
    const images = getProductImages(product);
    if (images.length === 0) return undefined;

    const mainImage = images.find(img => img.isMain) || images[0];
    return mainImage.url;
};

/**
 * Get sorted image URLs as a simple array
 * Useful for carousels and simple image displays
 */
export const getProductImageUrls = (product: Product): string[] => {
    return getProductImages(product).map(img => img.url);
};
