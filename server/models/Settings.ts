import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
    pricePercentage: number;
    shippingFee: number;
    freeShippingThreshold: number;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
    pricePercentage: { type: Number, default: 100 },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
}, { timestamps: true });

export default model<ISettings>('Settings', SettingsSchema);
