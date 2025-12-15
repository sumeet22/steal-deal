#!/bin/bash

# Performance Optimization Quick Fixes
# Run this script to apply the most critical performance improvements

set -e

echo "🚀 Starting Performance Optimizations..."
echo ""

# 1. Install proper TailwindCSS
echo "📦 Installing TailwindCSS properly..."
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# 2. Initialize Tailwind config
echo "⚙️  Creating Tailwind configuration..."
npx tailwindcss init -p

# 3. Install compression middleware
echo "📦 Installing compression middleware..."
npm install compression
npm install -D @types/compression

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next manual steps:"
echo ""
echo "1. Update tailwind.config.js with:"
echo "   content: ['./index.html', './**/*.{js,ts,jsx,tsx}']"
echo ""
echo "2. Add to index.css (at the top):"
echo "   @tailwind base;"
echo "   @tailwind components;"
echo "   @tailwind utilities;"
echo ""
echo "3. Remove this line from index.html:"
echo "   <script src=\"https://cdn.tailwindcss.com\"></script>"
echo ""
echo "4. Add compression to server/index.ts (see PERFORMANCE_AUDIT.md)"
echo ""
echo "5. Add database indexes to server/models/Product.ts (see PERFORMANCE_AUDIT.md)"
echo ""
echo "6. Configure MongoDB connection pooling (see PERFORMANCE_AUDIT.md)"
echo ""
echo "🎉 Run 'npm run build' to test the optimizations!"
