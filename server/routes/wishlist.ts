import express, { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/wishlist - Get user's wishlist
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let wishlist = await Wishlist.findOne({ userId: userId as any }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        if (!wishlist) {
            // Create empty wishlist if doesn't exist
            wishlist = new Wishlist({ userId: userId as any, items: [] });
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/wishlist/add - Add item to wishlist
router.post('/add', async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'User ID and Product ID are required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            // Create new wishlist
            wishlist = new Wishlist({
                userId,
                items: [{ productId, addedAt: new Date() }]
            });
        } else {
            // Check if product already in wishlist
            const existingItem = wishlist.items.find(
                item => item.productId.toString() === productId
            );

            if (existingItem) {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }

            // Add to wishlist
            wishlist.items.push({ productId, addedAt: new Date() });
        }

        await wishlist.save();

        // Populate and return
        await wishlist.populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        res.json(wishlist);
    } catch (error: any) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/wishlist/remove - Remove item from wishlist
router.delete('/remove', async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'User ID and Product ID are required' });
        }

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        // Remove item
        wishlist.items = wishlist.items.filter(
            item => item.productId.toString() !== productId
        );

        await wishlist.save();

        // Populate and return
        await wishlist.populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        res.json(wishlist);
    } catch (error: any) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete('/clear', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.items = [];
        await wishlist.save();

        res.json(wishlist);
    } catch (error: any) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
