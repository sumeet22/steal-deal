import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  category: Schema.Types.ObjectId;
  image?: string;
  tags?: ('new' | 'sale')[];
  viewCount?: number;
  addToCartCount?: number;
  soldLast24Hours?: number;
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
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ tags: 1 });

export default model<IProduct>('Product', ProductSchema);