import { Schema, model, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';

export interface ProductImage {
  url: string;
  order: number;
  isMain: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  category: Schema.Types.ObjectId;
  image?: string; // Deprecated, kept for backward compatibility
  images?: ProductImage[]; // New: array of images (max 5)
  tags?: ('new' | 'sale')[];
  viewCount?: number;
  addToCartCount?: number;
  soldLast24Hours?: number;
  outOfStock?: boolean; // Manual or automatic out of stock flag
  isNewArrival?: boolean; // Mark product for New Arrivals page
  isLimitedEdition?: boolean; // Mark product as limited edition
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  image: {
    type: String,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      order: {
        type: Number,
        required: true,
        min: 0,
      },
      isMain: {
        type: Boolean,
        default: false,
      },
    },
  ],
  tags: [
    {
      type: String,
      enum: ['new', 'sale'],
    },
  ],
  viewCount: {
    type: Number,
    default: 0,
  },
  addToCartCount: {
    type: Number,
    default: 0,
  },
  soldLast24Hours: {
    type: Number,
    default: 0,
  },
  outOfStock: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isLimitedEdition: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ tags: 1 });

// Critical indexes for performance optimization
ProductSchema.index({ isNewArrival: 1, createdAt: -1 }); // For new arrivals page
ProductSchema.index({ isLimitedEdition: 1, createdAt: -1 }); // For limited editions
ProductSchema.index({ category: 1, createdAt: -1 }); // Compound for category + sorting
ProductSchema.index({ outOfStock: 1 }); // For filtering in-stock items
ProductSchema.index({ stockQuantity: 1 }); // For stock queries

// Middleware to automatically set outOfStock when stockQuantity is 0
// Note: Disabled due to TypeScript/Mongoose callback issues
// Handling this logic in the application layer instead
// ProductSchema.pre('save', function (next: CallbackWithoutResultAndOptionalError) {
//   if ((this as any).stockQuantity <= 0) {
//     (this as any).outOfStock = true;
//   }
//   next();
// });

// Middleware for findOneAndUpdate to automatically set outOfStock
// Note: Disabled due to TypeScript/Mongoose callback issues
// Handling this logic in the application layer instead
// ProductSchema.pre('findOneAndUpdate', function (next: CallbackWithoutResultAndOptionalError) {
//   const update: any = (this as any).getUpdate();
//   if (update && update.stockQuantity !== undefined && update.stockQuantity <= 0) {
//     update.outOfStock = true;
//   }
//   next();
// });

export default model<IProduct>('Product', ProductSchema);