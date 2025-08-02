import mongoose, { Document, Schema } from 'mongoose';

export interface IChannelRule extends Document {
  serverId: string;
  channelId: string;
  channelName: string;
  expirationHours: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  settings: {
    preservePinned: boolean;
    excludeRoles: string[];
    excludeUsers: string[];
  };
  stats: {
    messagesTracked: number;
    messagesDeleted: number;
    lastActivity: Date;
  };
}

const channelRuleSchema = new Schema<IChannelRule>({
  serverId: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  channelName: {
    type: String,
    required: true,
  },
  expirationHours: {
    type: Number,
    required: true,
    enum: [1, 6, 24, 168], // 1h, 6h, 24h, 7d
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true,
  },
  settings: {
    preservePinned: {
      type: Boolean,
      default: true,
    },
    excludeRoles: [
      {
        type: String,
      },
    ],
    excludeUsers: [
      {
        type: String,
      },
    ],
  },
  stats: {
    messagesTracked: {
      type: Number,
      default: 0,
    },
    messagesDeleted: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
});

// Compound unique index for server + channel
channelRuleSchema.index({ serverId: 1, channelId: 1 }, { unique: true });
channelRuleSchema.index({ serverId: 1, isActive: 1 });
channelRuleSchema.index({ expiresAt: 1 });

export const ChannelRule = mongoose.model<IChannelRule>(
  'ChannelRule',
  channelRuleSchema
);
