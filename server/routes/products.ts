import express, { Request, Response } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours } = req.body;
    if (!name || price == null || !categoryId) return res.status(400).json({ message: 'Missing required fields' });
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ message: 'Invalid category' });

    // Validate images array if provided
    if (images && images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category: category._id,
      image: image || imageUrl, // Keep for backward compatibility
      images: images || undefined,
      stockQuantity: stockQuantity ?? stock,
      tags,
      viewCount,
      addToCartCount,
      soldLast24Hours
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours } = req.body;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate images array if provided
    if (images && images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
    }

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (originalPrice !== undefined) update.originalPrice = originalPrice;
    if (categoryId !== undefined) update.category = categoryId;
    if (image !== undefined) update.image = image || imageUrl;
    else if (imageUrl !== undefined) update.image = imageUrl;
    if (images !== undefined) update.images = images;
    if (stockQuantity !== undefined) update.stockQuantity = stockQuantity;
    else if (stock !== undefined) update.stockQuantity = stock;
    if (tags !== undefined) update.tags = tags;
    if (viewCount !== undefined) update.viewCount = viewCount;
    if (addToCartCount !== undefined) update.addToCartCount = addToCartCount;
    if (soldLast24Hours !== undefined) update.soldLast24Hours = soldLast24Hours;
    update.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;