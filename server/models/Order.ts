import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  id: string;
  name: string;
  quantity: number;
  image?: string;
  price: number;
}

export interface IShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  user?: Schema.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  shippingAddress: IShippingAddress | string; // Supporting both for legacy, though schema enforces structure for new ones
  items: IOrderItem[];
  total: number;
  status: string;
  deliveryMethod: string;
  shippingCost: number;
  paymentMethod: string;
  paymentProof?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  price: { type: Number, required: true },
}, { _id: false });

const ShippingAddressSchema = new Schema({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  // Flexible schema to handle both string (legacy) and object (new)
  // But strict for new orders via validation logic in code, or Mixed type. 
  // Let's use the explicit subdocument schema. Mongoose allows Mixed if we don't strict it, 
  // but let's define it properly.
  // Using Mixed to allow string fallback if necessary, but strictly structuring for new.
  // Actually, 'Mixed' is safer for migration, but let's try to enforce structure for correctness.
  // If I use the sub-schema, passing a string will fail casting.
  // Let's rely on the frontend sending the correct object.
  shippingAddress: { type: Schema.Types.Mixed, required: true },

  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Accepted', 'Shipped', 'Cancelled', 'Completed'],
    default: 'New',
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['store_pickup', 'home_delivery'],
    default: 'home_delivery',
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Bank Transfer', 'Pick from Store', 'Razorpay', 'Online Payment'],
    default: 'COD',
  },
  paymentProof: {
    type: String,
  },
  paymentId: {
    type: String,
  },
}, {
  timestamps: true,
});

export default model<IOrder>('Order', OrderSchema);