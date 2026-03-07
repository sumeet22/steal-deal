import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    description: string;
    discountPercentage: number;
    minOrderAmount: number;
    expiryDate: Date;
    isActive: boolean;
    usageCount: number;
    isPublic: boolean; // Whether it shows up in "Available Coupons" list
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
}, { timestamps: true });

export default model<ICoupon>('Coupon', CouponSchema);
