import { Schema, model, Document } from 'mongoose';

export interface IWishlistItem {
    productId: Schema.Types.ObjectId;
    addedAt: Date;
}

export interface IWishlist extends Document {
    userId: Schema.Types.ObjectId;
    items: IWishlistItem[];
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            addedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, { timestamps: true });

// Index for faster queries
WishlistSchema.index({ userId: 1 });
WishlistSchema.index({ 'items.productId': 1 });

export default model<IWishlist>('Wishlist', WishlistSchema);
