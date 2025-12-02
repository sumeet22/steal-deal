import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/stealdeal');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', phone: '000-000-0000', role: 'admin' },
      { name: 'John Doe', email: 'john.doe@example.com', password: 'password123', phone: '111-111-1111', role: 'user' },
      { name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password123', phone: '222-222-2222', role: 'user' },
      { name: 'Peter Jones', email: 'peter.jones@example.com', password: 'password123', phone: '333-333-3333', role: 'user' },
      { name: 'Susan White', email: 'susan.white@example.com', password: 'password123', phone: '444-444-4444', role: 'user' }
    ]);

    const adminUser = users[0];
    const john = users[1];
    const jane = users[2];

    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Gadgets and electronic devices', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80' },
      { name: 'Books', description: 'Fiction and non-fiction titles', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80' },
      { name: 'Apparel', description: 'Clothing and accessories', image: 'https://images.unsplash.com/photo-1520975698510-330c7a5d3f48?w=1200&q=80' },
      { name: 'Home & Kitchen', description: 'Home essentials and kitchenware', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80' },
      { name: 'Toys & Games', description: 'Toys, puzzles and games for all ages', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80' }
    ]);

    const electronics = categories[0];
    const books = categories[1];
    const apparel = categories[2];
    const home = categories[3];
    const toys = categories[4];

    const productsToInsert = [
      { name: 'Laptop Pro 15', description: 'High performance laptop for professionals and gamers', price: 1499, originalPrice: 1699, category: electronics._id, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80', stockQuantity: randomInt(5, 25), tags: ['new'] },
      { name: 'Smartphone X', description: 'Flagship smartphone with excellent camera', price: 999, originalPrice: 1099, category: electronics._id, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80', stockQuantity: randomInt(10, 50) },
      { name: 'Wireless Headphones', description: 'Noise cancelling wireless over-ear headphones', price: 199, category: electronics._id, image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200&q=80', stockQuantity: randomInt(20, 100), tags: ['sale'] },

      { name: 'The Great Gatsby', description: 'Classic novel by F. Scott Fitzgerald', price: 12.99, category: books._id, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80', stockQuantity: randomInt(50, 200) },
      { name: 'Sapiens', description: 'A brief history of humankind', price: 18.5, category: books._id, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', stockQuantity: randomInt(30, 120) },
      { name: 'Children\'s Puzzle', description: 'Educational 500-piece puzzle for kids', price: 14.99, category: toys._id, image: 'https://images.unsplash.com/photo-1545235617-9465b6b7a1d2?w=1200&q=80', stockQuantity: randomInt(20, 200) },

      { name: 'Classic T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, category: apparel._id, image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?w=1200&q=80', stockQuantity: randomInt(50, 300) },
      { name: 'Denim Jeans', description: 'Stylish and durable denim jeans', price: 49.99, category: apparel._id, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80', stockQuantity: randomInt(30, 150) },
      { name: 'Non-Stick Frying Pan', description: '12-inch non-stick frying pan for everyday cooking', price: 34.99, category: home._id, image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200&q=80', stockQuantity: randomInt(15, 120) }
    ];

    const products = await Product.insertMany(productsToInsert);

    const laptop = products.find(p => p.name === 'Laptop Pro 15')!;
    const smartphone = products.find(p => p.name === 'Smartphone X')!;
    const gatsby = products.find(p => p.name === 'The Great Gatsby')!;
    const tshirt = products.find(p => p.name === 'Classic T-Shirt')!;

    await Order.insertMany([
      {
        user: john._id,
        orderItems: [
          { product: laptop._id, name: laptop.name, qty: 1, image: laptop.image, price: laptop.price },
          { product: gatsby._id, name: gatsby.name, qty: 2, image: gatsby.image, price: gatsby.price }
        ],
        shippingAddress: { address: '123 Main St', city: 'Anytown', postalCode: '12345', country: 'USA' },
        paymentMethod: 'PayPal',
        taxPrice: 15.0,
        shippingPrice: 7.5,
        totalPrice: laptop.price * 1 + gatsby.price * 2 + 15.0 + 7.5,
        isPaid: true,
        paidAt: new Date(),
        status: 'delivered'
      },
      {
        user: jane._id,
        orderItems: [
          { product: smartphone._id, name: smartphone.name, qty: 1, image: smartphone.image, price: smartphone.price }
        ],
        shippingAddress: { address: '456 Oak Ave', city: 'Otherville', postalCode: '67890', country: 'USA' },
        paymentMethod: 'Stripe',
        taxPrice: 10.0,
        shippingPrice: 5.0,
        totalPrice: smartphone.price + 10.0 + 5.0,
        isPaid: true,
        paidAt: new Date(),
        status: 'shipped'
      },
      {
        user: adminUser._id,
        orderItems: [
          { product: laptop._id, name: laptop.name, qty: 1, image: laptop.image, price: laptop.price }
        ],
        shippingAddress: { address: '789 Pine Ln', city: 'Admin City', postalCode: '00000', country: 'USA' },
        paymentMethod: 'Stripe',
        taxPrice: 18.0,
        shippingPrice: 8.0,
        totalPrice: laptop.price + 18.0 + 8.0,
        isPaid: true,
        paidAt: new Date(),
        status: 'completed'
      }
    ]);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();