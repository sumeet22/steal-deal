import nodemailer from 'nodemailer';
import { IOrder } from '../models/Order.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const APP_NAME = 'Steal Deal';
const PRIMARY_COLOR = '#4f46e5';
const BG_COLOR = '#f3f4f6';

const getEmailHeader = (title: string) => `
    <div style="background-color: ${PRIMARY_COLOR}; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${APP_NAME}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">${title}</p>
    </div>
`;

const getEmailFooter = () => `
    <div style="padding: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p style="margin: 5px 0;">You are receiving this email because you placed an order on our store.</p>
        <div style="margin-top: 20px;">
            <a href="#" style="color: ${PRIMARY_COLOR}; text-decoration: none; margin: 0 10px;">Support</a>
            <a href="#" style="color: ${PRIMARY_COLOR}; text-decoration: none; margin: 0 10px;">My Account</a>
        </div>
    </div>
`;

export const sendOrderConfirmation = async (order: IOrder, customerEmail: string) => {
    const adminEmail = process.env.EMAIL_USER;

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="font-weight: 600; color: #111827;">${item.name}</div>
                <div style="font-size: 12px; color: #6b7280;">Quantity: ${item.quantity}</div>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 700; color: #111827;">
                ₹${(item.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${BG_COLOR}; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                ${getEmailHeader('Order Confirmation')}
                
                <div style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 700;">Order Received!</h2>
                    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                        Hi ${order.customerName}, your order <strong>#${order._id}</strong> has been confirmed and is being processed. 
                        We'll notify you as soon as it's on its way.
                    </p>

                    <div style="background-color: #f9fafb; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="color: #6b7280; font-size: 13px; padding-bottom: 4px;">Payment Method</td>
                                <td style="color: #6b7280; font-size: 13px; padding-bottom: 4px; text-align: right;">Shipping Mode</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #111827;">${order.paymentMethod === 'Online Payment' ? 'Cashfree Online' : order.paymentMethod}</td>
                                <td style="font-weight: 700; color: #111827; text-align: right;">${order.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}</td>
                            </tr>
                        </table>
                    </div>

                    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                        <tr>
                            <td style="padding: 20px 0 0 0; font-size: 18px; font-weight: 800; color: #111827;">Total Paid</td>
                            <td style="padding: 20px 0 0 0; font-size: 22px; font-weight: 800; color: ${PRIMARY_COLOR}; text-align: right;">₹${order.total.toFixed(2)}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 40px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/profile" style="background-color: ${PRIMARY_COLOR}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">View Order Details</a>
                    </div>
                </div>

                <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 30px; border-radius: 0 0 20px 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #111827; font-size: 14px;">Delivery Address</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                        ${typeof order.shippingAddress === 'string' ? order.shippingAddress : `
                            ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
                        `}
                    </p>
                </div>
                ${getEmailFooter()}
            </div>
        </div>
    `;

    // 1. Send to Customer
    const customerMailOptions = {
        from: `"${APP_NAME}" <${adminEmail}>`,
        to: customerEmail,
        subject: `Order Confirmed: #${order._id}`,
        html: htmlContent
    };

    // 2. Send to Admin (Simplified Alert)
    const adminMailOptions = {
        from: `"Store Alert" <${adminEmail}>`,
        to: adminEmail,
        subject: `🚨 New Order: ₹${order.total} from ${order.customerName}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>New Order Received</h2>
                <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
                <p><strong>Total:</strong> ₹${order.total}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                <hr>
                ${htmlContent}
            </div>
        `
    };

    try {
        await Promise.all([
            transporter.sendMail(customerMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);
    } catch (error) {
        console.error('Email send failure:', error);
    }
};

export const sendOrderStatusUpdate = async (order: IOrder, customerEmail: string) => {
    const adminEmail = process.env.EMAIL_USER;

    let statusMessage = '';
    let statusIcon = '📦';
    let subTitle = 'Order Update';

    switch (order.status) {
        case 'Accepted':
            statusMessage = `Great news! Your order <strong>#${order._id}</strong> has been accepted and is now being prepared for shipping.`;
            statusIcon = '✅';
            subTitle = 'Order Accepted';
            break;
        case 'Shipped':
            statusMessage = `Your order <strong>#${order._id}</strong> has been shipped! You can expect delivery within the next few business days.`;
            statusIcon = '🚚';
            subTitle = 'Order Shipped';
            break;
        case 'Completed':
            statusMessage = `Your order <strong>#${order._id}</strong> has been successfully delivered. We hope you love your new items!`;
            statusIcon = '🥳';
            subTitle = 'Order Delivered';
            break;
        case 'Cancelled':
            statusMessage = `Your order <strong>#${order._id}</strong> has been cancelled. If you have already paid, a refund will be initiated automatically.`;
            statusIcon = '❌';
            subTitle = 'Order Cancelled';
            break;
        default:
            return; // Don't send for other statuses
    }

    const htmlContent = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${BG_COLOR}; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                ${getEmailHeader(subTitle)}
                
                <div style="padding: 40px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 20px;">${statusIcon}</div>
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 800;">Order ${order.status}!</h2>
                    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                        Hi ${order.customerName}, ${statusMessage}
                    </p>

                    <div style="background-color: #f9fafb; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 30px;">
                        <h3 style="font-size: 12px; text-transform: uppercase; color: #9ca3af; margin: 0 0 15px 0;">Order Summary</h3>
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                                <span style="color: #111827;">${item.name} x ${item.quantity}</span>
                                <span style="color: #6b7280;">₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-weight: 800;">
                            <span>Total</span>
                            <span style="color: ${PRIMARY_COLOR};">₹${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <a href="${process.env.FRONTEND_URL}/profile" style="background-color: ${PRIMARY_COLOR}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">Track Order History</a>
                </div>
                ${getEmailFooter()}
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${APP_NAME}" <${adminEmail}>`,
            to: customerEmail,
            subject: `${statusIcon} Order ${order.status}: #${order._id}`,
            html: htmlContent
        });
    } catch (error) {
        console.error('Status update email failed:', error);
    }
};
