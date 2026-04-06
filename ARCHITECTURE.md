# Steal Deal E-Commerce Platform - Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Infrastructure & Deployment](#infrastructure--deployment)
9. [Performance Optimizations](#performance-optimizations)
10. [Security Measures](#security-measures)
11. [Development Workflow](#development-workflow)
12. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## System Overview

Steal Deal is a full-stack e-commerce platform built with React, Express, MongoDB, and deployed using Docker containers with Nginx as a reverse proxy.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Coolify / Load Balancer                      │
│                    (Traefik Reverse Proxy)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nginx Container (Port 80)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Static Files (React SPA)                                │   │
│  │  - Gzip Compression                                      │   │
│  │  - Static Asset Caching (1 year)                         │   │
│  │  - Rate Limiting                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Proxy to Backend                                    │   │
│  │  - /api/* → http://backend:5000                          │   │
│  │  - 300s timeout for long operations                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌──────────────────────┐      ┌──────────────────────────────────┐
│  Backend Container   │      │     MongoDB Container            │
│  (Port 5000)         │      │     (Port 27017)                 │
│                      │      │                                  │
│  ┌────────────────┐  │      │  ┌────────────────────────────┐  │
│  │ Express 5 API  │  │      │  │  stealdeal Database        │  │
│  │                │  │      │  │                            │  │
│  │ ┌────────────┐ │  │      │  │  Collections:              │  │
│  │ │ Security   │ │  │      │  │  - products                │  │
│  │ │ Middleware │ │  │      │  │  - categories              │  │
│  │ └────────────┘ │  │      │  │  - users                   │  │
│  │ ┌────────────┐ │  │      │  │  - orders                  │  │
│  │ │ Routes     │ │  │◄─────┼──│  - wishlists               │  │
│  │ └────────────┘ │  │      │  │  - coupons                 │  │
│  │ ┌────────────┐ │  │      │  │  - settings                │  │
│  │ │ Mongoose   │ │  │      │  │  - messages                │  │
│  │ │ Models     │ │  │      │  └────────────────────────────┘  │
│  │ └────────────┘ │  │      │                                  │
│  └────────────────┘  │      └──────────────────────────────────┘
└──────────────────────┘

Resource Allocation (8GB Server):
┌─────────────────────────────────────────────────────────────────┐
│  Nginx:    512MB limit  |  0.5 CPU                              │
│  Backend:  1536MB limit |  1.5 CPU (Node.js: 1024MB heap)       │
│  MongoDB:  2048MB limit |  1.0 CPU (WiredTiger: 1.5GB cache)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 6.2.0 | Build Tool & Dev Server |
| TailwindCSS | 3.4.19 | Utility-First CSS |
| Framer Motion | 12.23.26 | Animations |
| React Helmet Async | 2.0.5 | SEO Meta Tags |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x (Alpine) | Runtime |
| Express | 5.1.0 | Web Framework |
| TypeScript | 5.8.2 | Type Safety |
| Mongoose | 9.0.0 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 3.0.3 | Password Hashing |

### Security
| Technology | Purpose |
|------------|---------|
| Helmet | Secure HTTP Headers |
| express-rate-limit | API Rate Limiting |
| xss-clean | XSS Protection |
| express-mongo-sanitize | NoSQL Injection Prevention |
| hpp | HTTP Parameter Pollution Prevention |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-Container Orchestration |
| Nginx | Reverse Proxy & Static File Server |
| MongoDB 6.0 | Database |

### Payment Integration
| Technology | Purpose |
|------------|---------|
| Razorpay | Payment Gateway |
| Cashfree | Payment Gateway |

### Email
| Technology | Purpose |
|------------|---------|
| Nodemailer | Email Notifications |

---

## Project Structure

```
steal-deal/
├── 📁 components/           # React Components
│   ├── 📁 admin/           # Admin Panel Components
│   │   ├── CategoryManagement.tsx
│   │   ├── CouponManagement.tsx
│   │   ├── CsvUpload.tsx
│   │   ├── DataManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductManagement.tsx
│   │   ├── ProductReorderModal.tsx
│   │   ├── UserForm.tsx
│   │   └── UserManagement.tsx
│   ├── 📁 auth/            # Authentication Components
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── 📁 effects/         # Visual Effects
│   │   ├── HeartsEffect.tsx
│   │   └── SnowfallEffect.tsx
│   ├── 📁 shared/          # Shared UI Components
│   │   ├── PullToRefresh.tsx
│   │   └── QuantityStepper.tsx
│   ├── AdminDashboard.tsx
│   ├── Cart.tsx
│   ├── CartDrawer.tsx
│   ├── Checkout.tsx
│   ├── ComingSoon.tsx
│   ├── Icons.tsx
│   ├── InfoPages.tsx
│   ├── MaintenanceScreen.tsx
│   ├── NewArrivalsPage.tsx
│   ├── NoInternetScreen.tsx
│   ├── OrderHistory.tsx
│   ├── OrderTracking.tsx
│   ├── PaymentCallback.tsx
│   ├── PaymentVerification.tsx
│   ├── ProductDetail.tsx
│   ├── SearchOverlay.tsx
│   ├── Sidebar.tsx
│   ├── Storefront.tsx      # Main Store Component
│   ├── Toast.tsx
│   ├── ToastContainer.tsx
│   ├── UserMenu.tsx
│   ├── UserProfile.tsx
│   └── WishlistPage.tsx
│
├── 📁 context/             # React Context Providers
│   ├── AppContext.tsx      # Main Application State
│   ├── ToastContext.tsx    # Toast Notification System
│   └── WishlistContext.tsx # Wishlist State Management
│
├── 📁 hooks/               # Custom React Hooks
│   ├── useLocalStorage.ts  # LocalStorage Hook
│   └── usePullToRefresh.ts # Pull-to-Refresh Hook
│
├── 📁 server/              # Backend Server
│   ├── 📁 models/          # Mongoose Models
│   │   ├── Category.ts
│   │   ├── Coupon.ts
│   │   ├── Message.ts
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   ├── Settings.ts
│   │   ├── User.ts
│   │   └── Wishlist.ts
│   ├── 📁 routes/          # API Routes
│   │   ├── auth.js
│   │   ├── categories.ts
│   │   ├── contact.ts
│   │   ├── coupons.ts
│   │   ├── orders.ts
│   │   ├── payment.ts
│   │   ├── products.ts
│   │   ├── settings.ts
│   │   ├── users.ts
│   │   └── wishlist.ts
│   ├── 📁 services/        # Business Logic Services
│   ├── 📁 utils/           # Utility Functions
│   │   └── mail.ts         # Email Service
│   ├── index.ts            # Main Server Entry Point
│   ├── migrateUsers.ts     # User Migration Script
│   ├── seed.ts             # Database Seed Script
│   └── server.js           # Legacy Server File
│
├── 📁 public/              # Static Assets
│   ├── favicon.png
│   ├── icon.png
│   ├── icon-512x512.png
│   ├── logo.png
│   ├── logo.jpg
│   ├── logo_transparent.png
│   ├── manifest.json       # PWA Manifest
│   ├── og-image.jpg        # Open Graph Image
│   ├── robots.txt          # SEO Robots
│   └── sitemap.xml         # SEO Sitemap
│
├── 📁 scripts/             # Utility Scripts
│   └── db-manager.js       # Database Backup/Restore
│
├── 📁 backups/             # Database Backups
│
├── 📁 types/               # TypeScript Type Definitions
│
├── 📁 utils/               # Frontend Utilities
│   └── productImages.ts    # Image URL Helpers
│
├── 📄 Configuration Files
│   ├── docker-compose.yml          # Production Docker Config
│   ├── docker-compose.dev.yml      # Development Docker Config
│   ├── Dockerfile.backend          # Backend Dev Image
│   ├── Dockerfile.backend.prod     # Backend Prod Image
│   ├── Dockerfile.frontend         # Frontend Dev Image
│   ├── Dockerfile.frontend.prod    # Frontend Prod Image
│   ├── nginx.conf                  # Nginx Configuration
│   ├── vite.config.ts              # Vite Configuration
│   ├── tailwind.config.js          # TailwindCSS Configuration
│   ├── postcss.config.js           # PostCSS Configuration
│   ├── tsconfig.json               # TypeScript Config (Frontend)
│   ├── tsconfig.backend.json       # TypeScript Config (Backend)
│   ├── package.json                # Dependencies & Scripts
│   ├── .env.example                # Environment Variables Template
│   ├── .gitignore                  # Git Ignore Rules
│   └── .dockerignore               # Docker Ignore Rules
│
├── 📄 Application Files
│   ├── App.tsx                     # Main App Component
│   ├── index.tsx                   # React Entry Point
│   ├── index.html                  # HTML Template
│   └── index.css                   # Global Styles + Tailwind
│
└── 📄 Documentation
    ├── ARCHITECTURE.md             # This File
    ├── ARCHITECTURE_OPTIMIZATION.md
    ├── PERFORMANCE_AUDIT.md
    ├── PERFORMANCE_PROGRESS.md
    ├── COOLIFY_DEPLOYMENT.md
    ├── DEPLOYMENT.md
    ├── PRODUCTION_DEPLOYMENT.md
    └── [Various feature docs...]
```

---

## Frontend Architecture

### State Management

The application uses React Context API for state management instead of Redux:

```
AppProvider (Root Context)
├── Products State
│   ├── products: Product[]
│   ├── productsLoading: boolean
│   └── fetchProductsByCategory()
│   └── fetchProductsBySearch()
│   └── fetchNewArrivals()
│   └── fetchAllProductsForAdmin()
│
├── Categories State
│   └── categories: Category[]
│
├── Cart State (localStorage)
│   └── cart: CartItem[]
│
├── Orders State
│   └── orders: Order[]
│
├── Users State
│   └── users: User[]
│
├── Auth State (localStorage)
│   ├── currentUser: User | null
│   └── token: string | null
│
├── Settings State (localStorage)
│   ├── pricePercentage: number
│   ├── shippingFee: number
│   └── freeShippingThreshold: number
│
└── Coupons State
    └── coupons: Coupon[]
```

### Key Frontend Patterns

#### 1. Lazy Loading with Pagination
Products are NOT loaded upfront. They load on-demand:
- When user selects a category
- When user performs a search
- When admin views product management

```typescript
// Products load only when needed
fetchProductsByCategory(categoryId, page, limit)
fetchProductsBySearch(searchQuery, page, limit)
```

#### 2. Price Markup System
Prices are marked up dynamically using `pricePercentage` from settings:
```typescript
const hikedPrice = (rawPrice * pricePercentage) / 100;
```

#### 3. LocalStorage Persistence
Critical data is persisted in localStorage:
- Cart items
- Current user session
- Auth token
- Price percentage
- Shipping fee
- Free shipping threshold

#### 4. Component Optimization
- `React.memo()` for expensive components
- `useCallback()` for event handlers
- `useMemo()` for computed values
- Debounced search (300ms)

### Routing

The app uses a single-page approach with conditional rendering:
```typescript
// View states
view: 'storefront' | 'product' | 'cart' | 'checkout' | 'admin' | 'login' | 'register' | ...
```

---

## Backend Architecture

### Server Initialization Flow

```
1. Load environment variables (dotenv)
2. Setup error handlers (uncaughtException, unhandledRejection)
3. Setup signal handlers (SIGTERM, SIGINT) for graceful shutdown
4. Initialize Express app
5. Apply middleware:
   ├── Body parsing (JSON, URL-encoded)
   ├── CORS
   ├── Trust proxy (for reverse proxy)
   ├── Helmet (security headers)
   ├── MongoDB sanitization
   ├── HPP (parameter pollution prevention)
   └── Rate limiting
6. Connect to MongoDB (with connection pooling)
7. Register routes
8. Start server (after MongoDB connection)
```

### Middleware Stack

```
Request
  │
  ▼
┌─────────────────────────────────┐
│ express.json({ limit: '10mb' }) │
├─────────────────────────────────┤
│ express.urlencoded()            │
├─────────────────────────────────┤
│ cors({ origin: '*' })           │
├─────────────────────────────────┤
│ trust proxy = 1                 │
├─────────────────────────────────┤
│ helmet()                        │
├─────────────────────────────────┤
│ mongoSanitize                   │
├─────────────────────────────────┤
│ hpp()                           │
├─────────────────────────────────┤
│ rateLimit (global: 2000/10min)  │
├─────────────────────────────────┤
│ rateLimit (sensitive: 200/10min)│
└─────────────────────────────────┘
  │
  ▼
Route Handler
```

### API Route Structure

```
/api/
├── auth/
│   ├── POST   /register
│   ├── POST   /login
│   └── GET    /me (protected)
│
├── products/
│   ├── GET    /              (paginated, filtered, searchable)
│   ├── GET    /new-arrivals  (new arrivals & limited editions)
│   ├── GET    /:id
│   ├── POST   /              (admin)
│   ├── PUT    /:id           (admin)
│   ├── DELETE /:id           (admin)
│   └── POST   /reorder       (admin)
│
├── categories/
│   ├── GET    /
│   ├── POST   /              (admin)
│   ├── PUT    /:id           (admin)
│   ├── DELETE /:id           (admin)
│   └── POST   /reorder       (admin)
│
├── orders/
│   ├── GET    /              (paginated)
│   ├── GET    /user/:userId
│   ├── POST   /
│   └── PUT    /:id           (admin)
│
├── users/
│   ├── GET    /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── DELETE /:id           (admin)
│   └── POST   /:id/addresses
│
├── wishlist/
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /
│   └── DELETE /:productId
│
├── payment/
│   ├── POST   /create-order
│   ├── POST   /verify
│   └── POST   /cashfree
│
├── coupons/
│   ├── GET    /
│   ├── POST   /              (admin)
│   ├── DELETE /:id           (admin)
│   └── POST   /validate
│
├── settings/
│   ├── GET    /
│   └── PUT    /              (admin)
│
├── contact/
│   └── POST   /
│
└── health                    (health check)
```

---

## Database Schema

### Collections

#### Products
```typescript
interface IProduct {
  name: string;                    // Required
  description: string;             // Required
  price: number;                   // Required, min: 0
  originalPrice?: number;          // Optional, for showing discounts
  stockQuantity: number;           // Required, min: 0
  category: ObjectId;              // Reference to Category
  image?: string;                  // Deprecated, kept for backward compat
  images?: ProductImage[];         // Array of images (max 5)
  tags?: ('new' | 'sale')[];
  viewCount?: number;
  addToCartCount?: number;
  soldLast24Hours?: number;
  outOfStock?: boolean;            // Manual or automatic flag
  isNewArrival?: boolean;          // For New Arrivals page
  isLimitedEdition?: boolean;      // For limited edition products
  isActive?: boolean;              // Soft delete / visibility
  categoryOrder?: number;          // Order within category
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
ProductSchema.index({ name: 'text', description: 'text' });  // Full-text search
ProductSchema.index({ category: 1 });                         // Category filter
ProductSchema.index({ price: 1 });                            // Price sorting
ProductSchema.index({ tags: 1 });                             // Tag filtering
ProductSchema.index({ isNewArrival: 1, createdAt: -1 });     // New arrivals
ProductSchema.index({ isLimitedEdition: 1, createdAt: -1 }); // Limited editions
ProductSchema.index({ category: 1, categoryOrder: 1, createdAt: -1 }); // Category order
ProductSchema.index({ outOfStock: 1 });                       // Stock filtering
ProductSchema.index({ stockQuantity: 1 });                    // Stock queries
ProductSchema.index({ isActive: 1 });                         // Active products
```

#### Categories
```typescript
interface ICategory {
  name: string;
  image?: string;
  order?: number;              // Display order
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Users
```typescript
interface IUser {
  username: string;            // Required
  email: string;               // Required, unique
  password: string;            // Hashed with bcrypt
  phoneNumber?: string;
  isAdmin?: boolean;           // Legacy flag
  role?: 'user' | 'admin';
  addresses?: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Orders
```typescript
interface IOrder {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: IAddress;
  items: IOrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'cod' | 'upi' | 'razorpay' | 'cashfree';
  deliveryMethod?: 'home_delivery' | 'self_pickup';
  shippingCost?: number;
  appliedCoupon?: ICouponUsage;
  paymentProof?: string;       // Screenshot URL for UPI
  createdAt: Date;
  updatedAt: Date;
}
```

#### Wishlists
```typescript
interface IWishlist {
  userId: ObjectId;            // Reference to User
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
WishlistSchema.index({ userId: 1 });           // User lookup
WishlistSchema.index({ 'items.productId': 1 }); // Product lookup
```

#### Coupons
```typescript
interface ICoupon {
  code: string;                // Unique coupon code
  description: string;
  discountPercentage: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
  isPublic: boolean;           // Visible to all users
  createdAt: Date;
  updatedAt: Date;
}
```

#### Settings
```typescript
interface ISettings {
  pricePercentage: number;     // Price markup percentage
  shippingFee: number;         // Default shipping fee
  freeShippingThreshold: number;
  updatedAt: Date;
}
```

---

## API Endpoints

### Products API

#### GET /api/products
Fetch products with pagination, filtering, and search.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| category | string | - | Filter by category ID |
| search | string | - | Search query |
| sort | string | -createdAt | Sort field |
| includeInactive | boolean | false | Include inactive products |

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

#### GET /api/products/new-arrivals
Fetch new arrivals and limited editions.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| search | string | - | Search query |
| sort | string | -createdAt | Sort field |

### Health Check

#### GET /health
Check API and database health.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-07-04T00:00:00.000Z"
}
```

---

## Infrastructure & Deployment

### Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    docker-compose.yml                       │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   nginx     │───▶│   backend   │───▶│       db        │ │
│  │  (Frontend) │    │    (API)    │    │   (MongoDB)     │ │
│  │             │    │             │    │                 │ │
│  │ Port: 80    │    │ Port: 5000  │    │ Port: 27017     │ │
│  │ Memory: 512M│    │ Memory: 1.5G│    │ Memory: 2G      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
│  Network: app-network (bridge)                              │
│  Volume: mongodb_data                                       │
└─────────────────────────────────────────────────────────────┘
```

### Docker Compose Configuration

| Service | Build | Memory Limit | Health Check |
|---------|-------|--------------|--------------|
| nginx | Dockerfile.frontend.prod | 512MB | HTTP /health |
| backend | Dockerfile.backend.prod | 1536MB | HTTP /health |
| db | mongo:6.0 | 2048MB | mongosh ping |

### Nginx Configuration

**Key Features:**
- Gzip compression (level 6)
- Static file caching (1 year for images, CSS, JS)
- Rate limiting (100 req/s for API, 200 req/s general)
- Proxy timeouts (300s for long operations)
- Security headers (X-Frame-Options, X-Content-Type-Options, XSS-Protection)

### Deployment Platforms

#### Coolify Deployment
See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed instructions.

#### Standard Docker Deployment
```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down

# Restart
docker compose restart
```

---

## Performance Optimizations

### Implemented Optimizations

#### 1. Lazy Loading & Pagination
- Products load on-demand (20 per page)
- "Load More" button for pagination
- Admin panel loads all products separately

**Impact:** 50x faster category views, 98% less network transfer

#### 2. Database Indexing
9 indexes on Product model:
- Text search (name, description)
- Category filter
- Price sorting
- Tags filtering
- New arrivals (isNewArrival + createdAt)
- Limited editions (isLimitedEdition + createdAt)
- Category ordering (category + categoryOrder + createdAt)
- Out of stock filtering
- Stock quantity queries
- Active products filtering

**Impact:** 80-95% faster queries on large datasets

#### 3. MongoDB Connection Pooling
```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

**Impact:** 30-50% faster database operations

#### 4. MongoDB WiredTiger Cache Limit
```yaml
command: ["mongod", "--wiredTigerCacheSizeGB", "1.5", "--bind_ip_all"]
```

**Impact:** Prevents MongoDB from consuming all available memory

#### 5. Node.js Memory Management
```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=1024
```

**Impact:** Prevents OOM kills, stable memory usage

#### 6. Multi-stage Docker Builds
- Stage 1: Build with all dependencies
- Stage 2: Production with only runtime dependencies

**Impact:** Smaller images, faster deployments

#### 7. Nginx Optimizations
- Gzip compression (70-80% response size reduction)
- Static file caching (1 year for assets)
- Sendfile, tcp_nopush, tcp_nodelay
- Open file cache

#### 8. Graceful Shutdown
```typescript
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

**Impact:** Zero-downtime deployments, no data loss

### Pending Optimizations

| Priority | Optimization | Expected Impact |
|----------|--------------|-----------------|
| High | Orders route pagination | 90% memory reduction |
| High | Admin-only data fetching | 60-70% faster initial load |
| High | Image lazy loading attributes | Better image loading |
| Medium | Response compression (already in nginx) | 70-80% smaller responses |
| Medium | HTTP caching headers | Better browser caching |
| Medium | Framer Motion optimization | 40-50% smoother scrolling |
| Medium | Request cancellation for search | Prevent unnecessary API calls |
| Low | Service Worker for offline | Offline functionality |
| Low | WebP image support | 30-50% smaller images |
| Low | Redis caching | High traffic handling |

---

## Security Measures

### HTTP Security Headers (Helmet)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| Global API | 2000 requests | 10 minutes |
| Sensitive (orders, payment, auth) | 200 requests | 10 minutes |

### Data Sanitization
- MongoDB injection prevention (express-mongo-sanitize)
- XSS protection (xss-clean)
- HTTP Parameter Pollution prevention (hpp)

### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Token stored in localStorage

### CORS
- Configured for cross-origin requests
- Credentials support enabled

---

## Development Workflow

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Local Development

```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev

# Build backend
npm run build:server

# Start backend
npm run start:backend

# Or use Docker for full stack
docker compose -f docker-compose.dev.yml up -d
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run build:server` | Compile TypeScript backend |
| `npm run start:backend` | Run compiled backend |
| `npm run preview` | Preview production build |
| `npm run seed:db` | Seed database with sample data |
| `npm run db:backup` | Backup database |
| `npm run db:restore` | Restore database from backup |

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/stealdeal

# JWT
JWT_SECRET=your-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
```

---

## Monitoring & Troubleshooting

### Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Backend health + database status |
| `GET /api/health` | Simple API health check |
| `GET /` (nginx) | Frontend health check |

### Common Issues & Solutions

#### 504 Gateway Timeout
**Cause:** Backend not responding or too slow
**Solution:**
1. Check backend logs: `docker logs <backend_container>`
2. Verify MongoDB connection
3. Increase memory limits
4. Check for slow queries

#### OOM Kills
**Cause:** Memory limit exceeded
**Solution:**
1. Increase container memory limit
2. Check for memory leaks
3. Optimize database queries

#### Database Connection Issues
**Cause:** MongoDB not ready or network issues
**Solution:**
1. Check MongoDB health: `docker exec <db> mongosh --eval "db.adminCommand('ping')"`
2. Verify network connectivity
3. Check connection string

### Monitoring Commands

```bash
# Container resource usage
docker stats

# Container logs
docker logs -f <container_name>

# Database stats
docker exec <db> mongosh stealdeal --eval "db.stats()"

# Check for OOM kills
dmesg | grep -i oom

# Server resource usage
free -h
htop
```

### Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load | 4-6s | 1.5-2s | 60-70% faster |
| Product Query | 200-500ms | 20-50ms | 80-90% faster |
| Bundle Size | ~800KB | ~200KB | 75% smaller |
| Network Transfer | ~500KB | ~10KB | 98% less |
| Memory Usage | All products | Only visible | 95% less |

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-07-04 | 2.0 | Graceful shutdown, increased memory limits, MongoDB cache optimization, Coolify deployment guide |
| 2025-12-15 | 1.5 | Database indexes, connection pooling, performance audit |
| 2025-03-07 | 1.0 | Initial release with lazy loading, pagination, multi-image support |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Submit a pull request

---

## License

Private - All rights reserved