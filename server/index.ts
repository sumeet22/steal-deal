import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Basic Middleware
app.use(express.json());
app.use(cors());

// Security Middleware
app.use(helmet()); // Secure HTTP headers
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection (Incompatible with Express 5)
// app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter); // Apply to all API routes

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/stealdeal')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import authRoutes from './routes/auth.js';

import paymentRouter from './routes/payment.js';

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});