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
      sort = '-createdAt', // Default: newest first
      includeInactive // Admin flag
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Only show active products unless explicitly requested (e.g. by admin)
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

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

    // Filter by specific IDs (comma separated)
    // STRICT FILTERING: If 'ids' param is present, we MUST filter by it.
    // Do not fall back to showing all products if the list is empty.
    if (req.query.ids !== undefined) {
      const idsParam = String(req.query.ids); // ensure string
      console.log('Filtering by IDs:', idsParam);
      const idsArray = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);

      // Check if IDs are valid ObjectIds to prevent casting errors
      // (Optional: mongo might handle string IDs if they are valid 24-char hex)

      query._id = { $in: idsArray };
    }

    // Execute query with pagination
    // Sort by categoryOrder first (for category views), then by specified sort
    const sortQuery: any = category ? { categoryOrder: 1 } : {};
    if (sort && typeof sort === 'string') {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortDirection = sort.startsWith('-') ? -1 : 1;
      sortQuery[sortField] = sortDirection;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort(sortQuery)
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

// GET /api/products/new-arrivals - Fetch new arrivals and limited editions with pagination
router.get('/new-arrivals', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      sort = '-createdAt' // Default: newest first
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query - products marked as new arrivals OR limited editions
    // MUST BE ACTIVE
    const query: any = {
      isActive: true,
      $or: [
        { isNewArrival: true },
        { isLimitedEdition: true }
      ]
    };

    // Search filter (name and description)
    if (search && typeof search === 'string' && search.trim()) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { description: { $regex: search.trim(), $options: 'i' } }
          ]
        }
      ];
      delete query.$or; // Remove the original $or since we're using $and
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
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
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours, outOfStock, isNewArrival, isLimitedEdition, isActive } = req.body;
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
      outOfStock: finalOutOfStock,
      isNewArrival,
      isLimitedEdition,
      isActive: isActive !== undefined ? isActive : true
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
    const { name, description, price, originalPrice, category: categoryId, image, imageUrl, images, stock, stockQuantity, tags, viewCount, addToCartCount, soldLast24Hours, outOfStock, isNewArrival, isLimitedEdition, isActive } = req.body;
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
    if (isNewArrival !== undefined) update.isNewArrival = isNewArrival;
    if (isLimitedEdition !== undefined) update.isLimitedEdition = isLimitedEdition;
    if (isActive !== undefined) update.isActive = isActive;

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

// Reorder products within a category
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { productIds, categoryId } = req.body; // Array of product IDs in new order, categoryId for validation

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: 'productIds must be an array' });
    }

    // Update categoryOrder for each product
    const updatePromises = productIds.map((id, index) =>
      Product.findByIdAndUpdate(id, { categoryOrder: index }, { new: true })
    );

    await Promise.all(updatePromises);

    // Return updated products in new order
    const query: any = {};
    if (categoryId) {
      query.category = categoryId;
    }
    const products = await Product.find(query).sort({ categoryOrder: 1, createdAt: -1 }).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;