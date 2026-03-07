import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Basic Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true }));

// Trust proxy - Required when behind reverse proxy (Railway, Render, nginx, etc.)
// This allows express-rate-limit to correctly identify users by their real IP
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Secure HTTP headers
// Custom Sanitization for Express 5 compatibility
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2000, // Allow more for browsing
  message: 'Too many requests from this IP, please try again after 10 minutes'
});

const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20, // 20 requests per 10 mins (orders, payments, login)
  message: 'Too many requests to this sensitive endpoint. Please wait.'
});

app.use('/api', globalLimiter);

// Apply stricter limits to sensitive routes
app.use('/api/orders', strictLimiter);
app.use('/api/payment', strictLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/stealdeal', {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2,  // Minimum number of connections to maintain
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
})
  .then(() => console.log('MongoDB connected with connection pooling'))
  .catch(err => console.error(err));

import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import authRoutes from './routes/auth.js';
import wishlistRouter from './routes/wishlist.js';

import paymentRouter from './routes/payment.js';

import contactRouter from './routes/contact.js';
import settingsRouter from './routes/settings.js';
import couponRouter from './routes/coupons.js';

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/coupons', couponRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});