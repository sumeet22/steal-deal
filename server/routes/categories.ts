import express, { Request, Response } from 'express';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1, _id: 1 }); // Sort by order, then by _id
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    // Get the highest order value and add 1
    const maxOrderCategory = await Category.findOne().sort({ order: -1 });
    const order = maxOrderCategory ? (maxOrderCategory.order || 0) + 1 : 0;

    const category = new Category({ name, description, image, order });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (image !== undefined && image !== null) {
      if (typeof image === 'string') {
        const trimmed = image.trim();
        if (trimmed !== '') update.image = trimmed;
      } else {
        update.image = image;
      }
    }
    update.updatedAt = new Date();

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Reorder categories
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { categoryIds } = req.body; // Array of category IDs in new order

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ message: 'categoryIds must be an array' });
    }

    // Update order for each category
    const updatePromises = categoryIds.map((id, index) =>
      Category.findByIdAndUpdate(id, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    // Return updated categories in new order
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Toggle category active status
router.patch('/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.isActive = !category.isActive;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;