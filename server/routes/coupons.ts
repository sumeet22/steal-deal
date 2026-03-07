import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// GET all coupons (Admin)
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET public coupons (Checkout)
router.get('/public', async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isPublic: true,
            isActive: true,
            expiryDate: { $gt: now }
        }).sort({ discountPercentage: -1 });
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// VALIDATE a coupon code
router.post('/validate', async (req, res) => {
    try {
        const { code, cartAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (cartAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`
            });
        }

        res.json(coupon);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE coupon (Admin)
router.post('/', async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE coupon (Admin)
router.put('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(coupon);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE coupon (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
