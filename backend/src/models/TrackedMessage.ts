import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackedMessage extends Document {
  messageId: string;
  channelId: string;
  serverId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
  expiresAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletionReason?: 'expired' | 'manual' | 'rule_removed';
}

const trackedMessageSchema = new Schema<ITrackedMessage>({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  serverId: {
    type: String,
    required: true,
    index: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  authorUsername: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 100, // First 100 chars only
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
  },
  deletionReason: {
    type: String,
    enum: ['expired', 'manual', 'rule_removed'],
  },
});

// Critical indexes for performance
trackedMessageSchema.index({ expiresAt: 1, isDeleted: 1 }); // Cron queries
trackedMessageSchema.index({ serverId: 1, channelId: 1 }); // Analytics
trackedMessageSchema.index({ createdAt: 1 }); // Cleanup queries

export const TrackedMessage = mongoose.model<ITrackedMessage>(
  'TrackedMessage',
  trackedMessageSchema
);
