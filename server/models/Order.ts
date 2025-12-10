import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  id: string;
  name: string;
  quantity: number;
  image?: string;
  price: number;
}

export interface IOrder extends Document {
  user?: Schema.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: IOrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
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

const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Accepted', 'Shipped', 'Cancelled', 'Completed'],
    default: 'New',
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Bank Transfer', 'Razorpay'],
    default: 'COD',
  },
  paymentId: {
    type: String,
  },
}, {
  timestamps: true,
});

export default model<IOrder>('Order', OrderSchema);