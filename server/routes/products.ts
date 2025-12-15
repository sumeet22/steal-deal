import express, { Request, Response } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/products - Optimized with pagination, filtering, and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      search,
      sort = '-createdAt' // Default: newest first
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter (name and description)
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + products.length < total
      }
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours, outOfStock } = req.body;
    if (!name || price == null || !categoryId) return res.status(400).json({ message: 'Missing required fields' });
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ message: 'Invalid category' });

    // Validate images array if provided
    if (images && images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
    }

    const finalStockQuantity = stockQuantity ?? stock ?? 0;
    const finalOutOfStock = outOfStock !== undefined ? outOfStock : (finalStockQuantity <= 0);

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category: category._id,
      image: image || imageUrl, // Keep for backward compatibility
      images: images || undefined,
      stockQuantity: finalStockQuantity,
      tags,
      viewCount,
      addToCartCount,
      soldLast24Hours,
      outOfStock: finalOutOfStock
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
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours, outOfStock } = req.body;
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

    // Auto-set outOfStock if stockQuantity is 0 or less, unless explicitly provided
    if (outOfStock !== undefined) {
      update.outOfStock = outOfStock;
    } else if (update.stockQuantity !== undefined && update.stockQuantity <= 0) {
      update.outOfStock = true;
    }

    update.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error });
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