import express, { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate('user').populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { user, orderItems, shippingAddress, paymentMethod, taxPrice = 0, shippingPrice = 0, totalPrice = 0 } = req.body;
    if (!user || !orderItems || orderItems.length === 0) return res.status(400).json({ message: 'Invalid order data' });

    // Basic validation for products
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.product}` });
    }

    const order = new Order({ user, orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('orderItems.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (updates.orderItems) {
      for (const item of updates.orderItems) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(400).json({ message: `Product not found: ${item.product}` });
      }
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { ...updates, updatedAt: new Date() }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;