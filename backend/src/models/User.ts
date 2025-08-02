import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  discordId: string;
  username: string;
  avatar?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  createdAt: Date;
  lastLogin: Date;
}

const userSchema = new Schema<IUser>({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  tokenExpiry: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
userSchema.index({ discordId: 1 });
userSchema.index({ tokenExpiry: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
