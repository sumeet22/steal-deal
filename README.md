# 🛍️ Steal Deal — E-Commerce Platform

A full-stack e-commerce platform built with **React + Vite** (frontend), **Express + Node.js** (backend), and **MongoDB** (database). Supports product/category management, cart, wishlist, orders, Razorpay payments, and a **web scraping integration** to import products and categories from external websites.

---

## 📁 Project Structure

```
steal-deal/
├── components/          # React UI components
├── context/             # React context (Auth, Cart, etc.)
├── hooks/               # Custom React hooks
├── server/
│   ├── models/          # Mongoose models (Product, Category, Order, User, Wishlist)
│   ├── routes/          # Express API routes
│   └── index.ts         # Express app entry point
├── scripts/             # Utility scripts (seed, migration)
├── public/              # Static assets
├── .env.example         # Environment variable template
└── docker-compose.yml   # Docker setup
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/stealdeal

# Auth
JWT_SECRET=your-super-secret-key

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Backend
BASE_URL=http://localhost:5000
PORT=5000
NODE_ENV=development

# Gemini AI (optional)
GEMINI_API_KEY=your-gemini-api-key

# Razorpay Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

---

## 🚀 Run Locally

**Prerequisites:** Node.js v18+, MongoDB

```bash
# Install dependencies
npm install

# Start backend server (port 5000)
npm run start:backend

# Start frontend (port 5173)
npm run dev
```

**With Docker:**

```bash
docker-compose up --build
```

---

## 🗄️ Database Models

### Product

| Field            | Type       | Required | Description                              |
|------------------|------------|----------|------------------------------------------|
| `name`           | String     | ✅       | Product name                             |
| `description`    | String     | ✅       | Product description                      |
| `price`          | Number     | ✅       | Selling price (INR)                      |
| `originalPrice`  | Number     | ❌       | MRP / original price (for discount %)    |
| `stockQuantity`  | Number     | ✅       | Available quantity                       |
| `category`       | ObjectId   | ✅       | Reference to `Category` document         |
| `images`         | Array      | ❌       | Array of `{ url, order, isMain }` (max 5)|
| `tags`           | Array      | ❌       | `['new', 'sale']`                        |
| `outOfStock`     | Boolean    | ❌       | Manual override for stock status         |
| `isNewArrival`   | Boolean    | ❌       | Show in New Arrivals section             |
| `isLimitedEdition`| Boolean  | ❌       | Mark as limited edition                  |
| `isActive`       | Boolean    | ❌       | Whether product is visible (default: true)|
| `categoryOrder`  | Number     | ❌       | Custom ordering within category          |

### Category

| Field         | Type    | Required | Description                         |
|---------------|---------|----------|-------------------------------------|
| `name`        | String  | ✅       | Unique category name                |
| `description` | String  | ❌       | Category description                |
| `image`       | String  | ❌       | Category image URL                  |
| `order`       | Number  | ❌       | Display order                       |
| `isActive`    | Boolean | ❌       | Whether category is visible         |

---

## 🌐 API Endpoints

### Categories
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/categories`         | List all categories      |
| POST   | `/api/categories`         | Create a category        |
| PUT    | `/api/categories/:id`     | Update a category        |
| DELETE | `/api/categories/:id`     | Delete a category        |

### Products
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/products`           | List all products (paginated) |
| GET    | `/api/products/:id`       | Get single product       |
| POST   | `/api/products`           | Create a product         |
| PUT    | `/api/products/:id`       | Update a product         |
| DELETE | `/api/products/:id`       | Delete a product         |

---

## 🕷️ Scraping Tool — Import Products & Categories

To scrape product/category data from external websites and insert them into the database, you need to build or configure a scraper with the following information.

### What the Scraper Needs to Provide

#### For **Categories** — POST `/api/categories`

```json
{
  "name": "Electronics",
  "description": "Gadgets and devices",
  "image": "https://cdn.example.com/electronics.jpg",
  "order": 1
}
```

#### For **Products** — POST `/api/products`

```json
{
  "name": "Wireless Earbuds",
  "description": "Bluetooth 5.0 earbuds with 24hr battery",
  "price": 999,
  "originalPrice": 1999,
  "stockQuantity": 50,
  "category": "<MongoDB_Category_ID>",
  "images": [
    { "url": "https://cdn.example.com/img1.jpg", "order": 0, "isMain": true },
    { "url": "https://cdn.example.com/img2.jpg", "order": 1, "isMain": false }
  ],
  "tags": ["new", "sale"],
  "isNewArrival": true,
  "isActive": true
}
```

---

### Recommended Scraping Libraries (Node.js)

| Library        | Use Case                                       |
|----------------|------------------------------------------------|
| `puppeteer`    | JS-rendered websites (SPAs, lazy-loaded content)|
| `playwright`   | Cross-browser automation, better for modern SPAs|
| `cheerio`      | Static HTML parsing (fast, lightweight)        |
| `axios`        | Fetching raw HTML from plain HTML sites        |

Install what you need:

```bash
npm install puppeteer cheerio axios
# or
npm install playwright
```

---

### Scraper Script Template

Create `scripts/scraper.ts` (or `.js`):

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import Category from '../server/models/Category.js';
import Product from '../server/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.BASE_URL || 'http://localhost:5000';

// ------------------------------------------------------------------
// STEP 1: Scrape target website for category/product data
// ------------------------------------------------------------------
async function scrapeWebsite(url: string) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(html);

  // Example: adjust selectors to match the target site's HTML
  const products: any[] = [];

  $('.product-card').each((_, el) => {
    products.push({
      name:          $(el).find('.product-title').text().trim(),
      description:   $(el).find('.product-desc').text().trim(),
      price:         parseFloat($(el).find('.sale-price').text().replace(/[^0-9.]/g, '')),
      originalPrice: parseFloat($(el).find('.original-price').text().replace(/[^0-9.]/g, '')),
      imageUrl:      $(el).find('img').attr('src') || '',
      category:      $(el).find('.category-name').text().trim(),
    });
  });

  return products;
}

// ------------------------------------------------------------------
// STEP 2: Upsert category — create if not exists, return its _id
// ------------------------------------------------------------------
async function getOrCreateCategory(name: string): Promise<string> {
  let cat = await Category.findOne({ name });
  if (!cat) {
    cat = await Category.create({ name, isActive: true });
    console.log(`Created category: ${name}`);
  }
  return cat._id.toString();
}

// ------------------------------------------------------------------
// STEP 3: Insert scraped products into MongoDB
// ------------------------------------------------------------------
async function importProducts(scrapedProducts: any[]) {
  for (const item of scrapedProducts) {
    const categoryId = await getOrCreateCategory(item.category || 'Uncategorized');

    const existing = await Product.findOne({ name: item.name });
    if (existing) {
      console.log(`Skipped (already exists): ${item.name}`);
      continue;
    }

    await Product.create({
      name:          item.name,
      description:   item.description || 'No description',
      price:         item.price || 0,
      originalPrice: item.originalPrice || null,
      stockQuantity: 10, // default stock; adjust as needed
      category:      categoryId,
      images: item.imageUrl
        ? [{ url: item.imageUrl, order: 0, isMain: true }]
        : [],
      isActive:      true,
      isNewArrival:  false,
    });

    console.log(`Imported: ${item.name}`);
  }
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------
async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stealdeal');
  console.log('Connected to MongoDB');

  const TARGET_URL = 'https://target-website.com/products'; // ← change this
  const scraped = await scrapeWebsite(TARGET_URL);
  console.log(`Scraped ${scraped.length} products`);

  await importProducts(scraped);
  console.log('Import complete');

  await mongoose.disconnect();
}

main().catch(console.error);
```

Run the scraper:

```bash
node --loader ts-node/esm scripts/scraper.ts
```

---

### What the Scraper Must Map

| Scraped Field         | DB Field          | Notes                                          |
|-----------------------|-------------------|------------------------------------------------|
| Product title/name    | `name`            | Required                                       |
| Description / About   | `description`     | Required (use placeholder if missing)          |
| Sale / current price  | `price`           | Required — strip currency symbols              |
| MRP / was-price       | `originalPrice`   | Optional                                       |
| Stock / quantity      | `stockQuantity`   | Required — default to 10 if not available      |
| Category name (text)  | `category`        | Must be resolved to a MongoDB ObjectId first   |
| Product image URLs    | `images[]`        | Array of `{ url, order, isMain }` — max 5      |
| Tags (new/sale)       | `tags`            | Only `"new"` and `"sale"` are valid            |

---

### Image Handling

External image URLs can be stored directly in the `images` array, or you can optionally download and re-host them:

**Option A — Store external URL directly (simple):**
```json
{ "url": "https://cdn.source-site.com/product.jpg", "order": 0, "isMain": true }
```

**Option B — Download and serve locally (recommended for production):**
```typescript
import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function downloadImage(url: string, filename: string): Promise<string> {
  const res = await axios.get(url, { responseType: 'stream' });
  const dest = path.join('public/images', filename);
  res.data.pipe(fs.createWriteStream(dest));
  return `/images/${filename}`;
}
```

---

### Anti-Bot & Rate Limiting Tips

- Add `User-Agent` headers mimicking a browser
- Add random delays between requests: `await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000))`
- Use Puppeteer/Playwright for sites that use JS rendering
- For Cloudflare-protected sites, use `puppeteer-real-browser` or stealth plugins

---

### Using the REST API Instead of Direct DB

If you prefer to insert via the API (e.g., from an external scraper service):

```bash
# Create a category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Clothing","description":"Apparel and fashion","order":2}'

# Create a product (replace CATEGORY_ID with the _id from above response)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red T-Shirt",
    "description": "100% cotton",
    "price": 299,
    "originalPrice": 599,
    "stockQuantity": 20,
    "category": "CATEGORY_ID",
    "images": [{"url":"https://example.com/shirt.jpg","order":0,"isMain":true}],
    "isActive": true
  }'
```

---

## 💳 Payments

Razorpay is integrated for payment processing. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.

---

## 🐳 Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build -d
```

---

## 📜 Scripts

| Command                     | Description                        |
|-----------------------------|------------------------------------|
| `npm run dev`               | Start frontend dev server          |
| `npm run start:backend`     | Start backend server               |
| `npm run seed:db`           | Seed the database with sample data |
| `npm run build`             | Build frontend for production      |
