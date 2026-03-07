import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ pricePercentage: 100, shippingFee: 0, freeShippingThreshold: 0 });
        }
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE settings
router.put('/', async (req, res) => {
    try {
        const { pricePercentage, shippingFee, freeShippingThreshold } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        if (pricePercentage !== undefined) settings.pricePercentage = pricePercentage;
        if (shippingFee !== undefined) settings.shippingFee = shippingFee;
        if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;

        await settings.save();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
