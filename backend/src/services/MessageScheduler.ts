import cron from 'node-cron';
import { TrackedMessage } from '../models/TrackedMessage';
import { ChannelRule } from '../models/ChannelRule';
import { client } from '../bot';
import { ErrorLogger } from './ErrorLogger';

export class MessageScheduler {
  private static scheduledJobs = new Map<string, NodeJS.Timeout>();

  // Schedule specific message deletion
  static scheduleMessageDeletion(messageId: string, expiresAt: Date): void {
    const now = new Date();
    const delay = expiresAt.getTime() - now.getTime();

    if (delay <= 0) {
      this.deleteMessage(messageId);
      return;
    }

    // Create timeout for this message
    const timeoutId = setTimeout(() => {
      this.deleteMessage(messageId);
    }, delay);

    this.scheduledJobs.set(messageId, timeoutId);
  }

  // Main cron job - runs every minute
  static startPeriodicCleanup(): void {
    cron.schedule('* * * * *', async () => {
      try {
        console.log('🧹 Checking for expired messages...');

        const expiredMessages = await TrackedMessage.find({
          expiresAt: { $lte: new Date() },
          isDeleted: false,
        }).limit(100); // Process 100 at a time

        console.log(`Found ${expiredMessages.length} expired messages`);

        for (const msg of expiredMessages) {
          await this.deleteMessage(msg.messageId);
        }
      } catch (error) {
        await ErrorLogger.logError(
          error as Error,
          'MessageScheduler.periodicCleanup'
        );
      }
    });

    console.log('✅ Periodic cleanup started');
  }

  // Delete message from Discord
  private static async deleteMessage(messageId: string): Promise<void> {
    try {
      const trackedMsg = await TrackedMessage.findOne({
        messageId,
        isDeleted: false,
      });

      if (!trackedMsg) {
        console.log(`Message ${messageId} already deleted or not found`);
        return;
      }

      const guild = client.guilds.cache.get(trackedMsg.serverId);
      if (!guild) {
        console.log(`Guild ${trackedMsg.serverId} not found`);
        return;
      }

      const channel = guild.channels.cache.get(trackedMsg.channelId);
      if (!channel || !channel.isTextBased()) {
        console.log(
          `Channel ${trackedMsg.channelId} not found or not text-based`
        );
        return;
      }

      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (message) {
        await message.delete();
        console.log(`✅ Deleted expired message: ${messageId}`);

        await ErrorLogger.logBotAction(
          'delete_message',
          trackedMsg.serverId,
          true,
          {
            messageId,
            channelId: trackedMsg.channelId,
            authorId: trackedMsg.authorId,
          }
        );
      } else {
        console.log(
          `Message ${messageId} not found in Discord (may have been deleted manually)`
        );
      }

      // Update database
      await TrackedMessage.findOneAndUpdate(
        { messageId },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletionReason: 'expired',
        }
      );

      // Update channel rule stats
      await ChannelRule.findOneAndUpdate(
        { serverId: trackedMsg.serverId, channelId: trackedMsg.channelId },
        {
          $inc: { 'stats.messagesDeleted': 1 },
          'stats.lastActivity': new Date(),
        }
      );

      // Update server stats
      await this.updateServerStats(trackedMsg.serverId);

      // Clean up scheduled job
      const job = this.scheduledJobs.get(messageId);
      if (job) {
        clearTimeout(job);
        this.scheduledJobs.delete(messageId);
      }
    } catch (error) {
      console.error(`❌ Failed to delete message ${messageId}:`, error);
      await ErrorLogger.logError(
        error as Error,
        'MessageScheduler.deleteMessage',
        { messageId }
      );
    }
  }

  // Update server statistics
  private static async updateServerStats(serverId: string): Promise<void> {
    try {
      const [totalTracked, totalDeleted, channelsWithRules] = await Promise.all(
        [
          TrackedMessage.countDocuments({ serverId }),
          TrackedMessage.countDocuments({ serverId, isDeleted: true }),
          ChannelRule.countDocuments({ serverId, isActive: true }),
        ]
      );

      await require('../models/Server').Server.findOneAndUpdate(
        { serverId },
        {
          'stats.totalMessagesTracked': totalTracked,
          'stats.totalMessagesDeleted': totalDeleted,
          'stats.channelsWithRules': channelsWithRules,
        }
      );
    } catch (error) {
      console.error('Failed to update server stats:', error);
    }
  }

  // Daily cleanup of old data
  static startDatabaseCleanup(): void {
    cron.schedule('0 3 * * *', async () => {
      try {
        console.log('🗑️ Cleaning up old deleted messages...');

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await TrackedMessage.deleteMany({
          isDeleted: true,
          deletedAt: { $lt: thirtyDaysAgo },
        });

        console.log(`🗑️ Cleaned up ${result.deletedCount} old messages`);
      } catch (error) {
        await ErrorLogger.logError(
          error as Error,
          'MessageScheduler.databaseCleanup'
        );
      }
    });
  }

  // Cancel scheduled deletion
  static cancelMessageDeletion(messageId: string): void {
    const job = this.scheduledJobs.get(messageId);
    if (job) {
      clearTimeout(job);
      this.scheduledJobs.delete(messageId);
    }
  }

  // Get scheduled jobs count (for monitoring)
  static getScheduledJobsCount(): number {
    return this.scheduledJobs.size;
  }

  // Clear all scheduled jobs (for testing/restart)
  static clearAllJobs(): void {
    for (const [messageId, timeoutId] of this.scheduledJobs) {
      clearTimeout(timeoutId);
    }
    this.scheduledJobs.clear();
  }
}
