import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import Order from '../models/Order.js';
import { sendOrderConfirmation } from '../utils/mail.js';

const router = express.Router();

// Fetch config dynamically to avoid issues with ESM hoisting/loading order
const getCFConfig = () => {
    const appId = process.env.CASHFREE_APP_ID?.trim();
    const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
    const environment = process.env.CASHFREE_ENVIRONMENT?.trim() || 'TEST';
    const url = environment === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    return { appId, secretKey, url };
};

router.post('/orders', async (req, res) => {
    try {
        const { order_amount, order_currency = 'INR', customer_details, order_id } = req.body;
        const config = getCFConfig();

        if (!config.appId || !config.secretKey) {
            console.error('CRITICAL: Cashfree credentials missing from environment!');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        if (!order_amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        // Cashfree minimum amount is 1.00 INR
        const finalAmount = Math.max(1, Number(order_amount));
        const sanitizedPhone = (customer_details?.customer_phone || '9999999999').replace(/\D/g, '').slice(-10);

        const data = {
            order_amount: finalAmount,
            order_currency: order_currency,
            order_id: order_id || `order_${Date.now()}`,
            customer_details: {
                customer_id: customer_details?.customer_id || `guest_${Date.now()}`,
                customer_email: customer_details?.customer_email || 'test@example.com',
                customer_phone: sanitizedPhone.length === 10 ? sanitizedPhone : '9999999999',
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?view=payment-verification&order_id={order_id}`
            }
        };

        console.log('--- CASHFREE REQUEST START ---');
        console.log('URL:', config.url);
        console.log('App ID:', config.appId);

        const response = await axios.post(config.url, data, {
            headers: {
                'x-client-id': config.appId,
                'x-client-secret': config.secretKey,
                'x-api-version': '2022-09-01',
                'Content-Type': 'application/json'
            }
        });

        console.log('Cashfree success response:', response.data);
        res.json(response.data);
    } catch (error: any) {
        const errorData = error.response?.data;
        console.error('--- CASHFREE REQUEST ERROR ---');
        console.error('Status:', error.response?.status);
        console.error('Error Data:', JSON.stringify(errorData, null, 2) || error.message);
        res.status(500).json({
            message: 'Cashfree order creation failed',
            error: errorData?.message || error.message,
            details: errorData || null
        });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { order_id } = req.body;
        const config = getCFConfig();

        const response = await axios.get(`${config.url}/${order_id}`, {
            headers: {
                'x-client-id': config.appId,
                'x-client-secret': config.secretKey,
                'x-api-version': '2022-09-01'
            }
        });

        const order = response.data;
        console.log(`[Verify] Order ID: ${order_id}, Cashfree Status: ${order.order_status}`);

        const cfStatus = order.order_status?.toUpperCase();

        if (cfStatus === 'PAID' || cfStatus === 'SUCCESS') {
            // 1. Update our local order status
            const trimmedOrderId = order_id.trim();
            const localOrder = await Order.findOneAndUpdate(
                { _id: trimmedOrderId },
                {
                    status: 'New',
                    paymentMethod: 'Online Payment',
                    paymentId: order.cf_order_id?.toString()
                },
                { new: true }
            );

            if (!localOrder) {
                console.error(`[Verify] Local order ${trimmedOrderId} NOT found.`);
                return res.status(404).json({ message: "Local order record not found in database." });
            }

            console.log(`[Verify] Local order ${trimmedOrderId} updated to 'New'.`);

            // Send emails
            try {
                const customerEmail = order.customer_details?.customer_email || 'customer@example.com';
                await sendOrderConfirmation(localOrder, customerEmail);
            } catch (mailErr) {
                console.error("[Verify] Mail sending failed:", mailErr);
                // Don't fail the verification if just email fails
            }

            return res.status(200).json({
                message: "Payment verified successfully",
                order: {
                    id: localOrder._id,
                    status: 'PAID',
                    amount: localOrder.total,
                    customer: order.customer_details
                }
            });
        } else {
            console.log(`[Verify] Order ${order_id} is not PAID. Status: ${order.order_status}`);
            return res.status(400).json({ message: `Payment status: ${order.order_status}`, status: order.order_status });
        }
    } catch (error: any) {
        const errorData = error.response?.data;
        console.error('Verification Error:', JSON.stringify(errorData, null, 2) || error.message);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
});

export default router;
