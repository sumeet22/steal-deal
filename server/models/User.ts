console.log('Loading User.ts schema');
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type?: 'Home' | 'Work' | 'Other';
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  addresses: IAddress[];
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  addresses: [AddressSchema],
  isBanned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next: Function) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password!);
};

export default model<IUser>('User', UserSchema);