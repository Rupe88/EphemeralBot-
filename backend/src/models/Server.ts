import mongoose, { Document, Schema } from 'mongoose';

export interface IServer extends Document {
  serverId: string;
  serverName: string;
  ownerId: string;
  subscription: 'free' | 'premium';
  subscriptionExpiry?: Date;
  createdAt: Date;
  isActive: boolean;
  settings: {
    timezone: string;
    notifyBeforeDelete: boolean;
  };
  stats: {
    totalMessagesTracked: number;
    totalMessagesDeleted: number;
    channelsWithRules: number;
  };
}

const serverSchema = new Schema<IServer>({
  serverId: {
    type: String,
    required: true,
    unique: true,
  },
  serverName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
  subscription: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  subscriptionExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifyBeforeDelete: {
      type: Boolean,
      default: false,
    },
  },
  stats: {
    totalMessagesTracked: {
      type: Number,
      default: 0,
    },
    totalMessagesDeleted: {
      type: Number,
      default: 0,
    },
    channelsWithRules: {
      type: Number,
      default: 0,
    },
  },
});

// Indexes for performance
serverSchema.index({ serverId: 1 });
serverSchema.index({ ownerId: 1 });
serverSchema.index({ subscription: 1, subscriptionExpiry: 1 });

export const Server = mongoose.model<IServer>('Server', serverSchema);
