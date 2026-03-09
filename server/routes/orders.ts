import express, { Request, Response } from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderStatusUpdate, sendOrderConfirmation } from '../utils/mail.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Public Order Tracking
router.get('/track/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      paymentId,
      deliveryMethod,
      appliedCoupon
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // --- SERVER SIDE PRICE VALIDATION ---
    const Product = (await import('../models/Product.js')).default;
    const Settings = (await import('../models/Settings.js')).default;
    const Coupon = (await import('../models/Coupon.js')).default;

    const settings = await Settings.findOne() || { pricePercentage: 100, shippingFee: 0, freeShippingThreshold: 0 };

    let dbSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.id || item._id);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` });
      }

      const itemPrice = (product.price * (settings.pricePercentage || 100)) / 100;
      const itemTotal = itemPrice * item.quantity;
      dbSubtotal += itemTotal;
      validatedItems.push({
        id: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: product.image || (product.images && product.images[0]?.url)
      });
    }

    // Calculate Discounts 
    let onlineDiscount = 0;
    if (paymentMethod === 'Online Payment') {
      onlineDiscount = dbSubtotal * 0.05;
    }

    let couponDiscount = 0;
    let finalAppliedCoupon = undefined;

    if (appliedCoupon && appliedCoupon.code) {
      const coupon = await Coupon.findOne({ code: appliedCoupon.code.toUpperCase(), isActive: true });
      const now = new Date();

      if (coupon && now <= coupon.expiryDate && dbSubtotal >= coupon.minOrderAmount) {
        couponDiscount = (dbSubtotal * (coupon.discountPercentage / 100));
        finalAppliedCoupon = {
          code: coupon.code,
          discountAmount: couponDiscount
        };
        // Increment usage
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
      }
    }

    // Shipping
    const isFreeShipping = settings.freeShippingThreshold > 0 && dbSubtotal >= settings.freeShippingThreshold;
    const dbShippingCost = (deliveryMethod === 'home_delivery' && !isFreeShipping) ? settings.shippingFee : 0;

    const finalTotal = Number((dbSubtotal + dbShippingCost - onlineDiscount - couponDiscount).toFixed(2));

    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: validatedItems,
      total: finalTotal,
      paymentMethod,
      paymentId: paymentId || undefined,
      deliveryMethod: deliveryMethod || 'home_delivery',
      shippingCost: dbShippingCost,
      appliedCoupon: finalAppliedCoupon,
      status: req.body.status || 'New'
    });

    const createdOrder = await order.save();

    // --- STOCK MANAGEMENT (COD only) ---
    // For COD, we decrement stock immediately because the order is "live".
    // For Online, we decrement after payment verification to avoid stock-locking attacks.
    if (paymentMethod === 'COD') {
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.id, {
          $inc: { stockQuantity: -item.quantity },
          $set: { outOfStock: false } // Safety reset
        });

        // Final check to mark as outOfStock if it hit zero
        const updated = await Product.findById(item.id);
        if (updated && updated.stockQuantity <= 0) {
          await Product.findByIdAndUpdate(item.id, { outOfStock: true, stockQuantity: 0 });
        }
      }
    }

    // --- NOTIFICATIONS ---
    try {
      if (customerEmail) {
        await sendOrderConfirmation(createdOrder, customerEmail);
      }
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.body.status && order.status !== req.body.status) {
      order.status = req.body.status;
      const updatedOrder = await order.save();

      try {
        // Prefer the email stored in the order, fallback to user lookup by phone
        const recipientEmail = order.customerEmail || (await User.findOne({ phone: order.customerPhone }))?.email;
        if (recipientEmail) {
          await sendOrderStatusUpdate(updatedOrder, recipientEmail);
        }
      } catch (err) {
        console.error('Failed to send status update email:', err);
      }
      return res.json(updatedOrder);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
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