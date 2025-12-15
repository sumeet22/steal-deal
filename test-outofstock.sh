#!/bin/bash

# Test script to verify outOfStock field persistence

echo "Testing outOfStock field persistence..."
echo ""

# Test 1: Create a product with outOfStock = true
echo "Test 1: Creating product with outOfStock = true"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Out of Stock Product",
    "description": "Testing outOfStock persistence",
    "price": 99.99,
    "stockQuantity": 5,
    "category": "674e3e8a9b1e2c3d4e5f6a7b",
    "outOfStock": true,
    "image": "https://placehold.co/400x400?text=Test"
  }')

PRODUCT_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created product ID: $PRODUCT_ID"
echo "Response: $RESPONSE"
echo ""

# Test 2: Fetch the product and verify outOfStock is saved
echo "Test 2: Fetching product to verify outOfStock field"
sleep 1
FETCH_RESPONSE=$(curl -s http://localhost:5000/api/products/$PRODUCT_ID)
echo "Fetched product: $FETCH_RESPONSE"
echo ""

# Test 3: Create a product with stockQuantity = 0 (should auto-set outOfStock)
echo "Test 3: Creating product with stockQuantity = 0"
RESPONSE2=$(curl -s -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto Out of Stock Product",
    "description": "Should auto-set outOfStock",
    "price": 49.99,
    "stockQuantity": 0,
    "category": "674e3e8a9b1e2c3d4e5f6a7b",
    "image": "https://placehold.co/400x400?text=Test2"
  }')

PRODUCT_ID2=$(echo $RESPONSE2 | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created product ID: $PRODUCT_ID2"
echo "Response: $RESPONSE2"
echo ""

# Test 4: Fetch and verify auto-set outOfStock
echo "Test 4: Verifying auto-set outOfStock"
sleep 1
FETCH_RESPONSE2=$(curl -s http://localhost:5000/api/products/$PRODUCT_ID2)
echo "Fetched product: $FETCH_RESPONSE2"
echo ""

echo "Tests completed!"
echo ""
echo "Cleanup: Delete test products? (y/n)"
read -r CLEANUP
if [ "$CLEANUP" = "y" ]; then
  curl -s -X DELETE http://localhost:5000/api/products/$PRODUCT_ID
  curl -s -X DELETE http://localhost:5000/api/products/$PRODUCT_ID2
  echo "Test products deleted"
fi
