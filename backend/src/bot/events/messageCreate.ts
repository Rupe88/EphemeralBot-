import { Message } from 'discord.js';
import { ChannelRule } from '../../models/ChannelRule';
import { TrackedMessage } from '../../models/TrackedMessage';
import { MessageScheduler } from '../../services/MessageScheduler';
import { ErrorLogger } from '../../services/ErrorLogger';

export async function handleMessageCreate(message: Message): Promise<void> {
  // Skip bots and DMs
  if (message.author.bot || !message.guild) {
    return;
  }

  // Skip if message content is not available (intent not enabled)
  if (!message.content) {
    return;
  }

  try {
    // Check for active expiration rule
    const rule = await ChannelRule.findOne({
      serverId: message.guild.id,
      channelId: message.channel.id,
      isActive: true,
    });

    if (!rule) {
      return; // No rule for this channel
    }

    // Calculate expiration time
    const expiresAt = new Date(
      Date.now() + rule.expirationHours * 60 * 60 * 1000
    );

    // Save to database
    const trackedMessage = new TrackedMessage({
      messageId: message.id,
      channelId: message.channel.id,
      serverId: message.guild.id,
      authorId: message.author.id,
      authorUsername: message.author.username,
      content: message.content.substring(0, 100), // First 100 chars
      createdAt: new Date(),
      expiresAt,
      isDeleted: false,
    });

    await trackedMessage.save();

    // Schedule deletion
    MessageScheduler.scheduleMessageDeletion(message.id, expiresAt);

    console.log(
      `📝 Tracked message ${message.id} - expires in ${rule.expirationHours}h`
    );

    // Update channel rule stats
    await ChannelRule.findByIdAndUpdate(rule._id, {
      $inc: { 'stats.messagesTracked': 1 },
      'stats.lastActivity': new Date(),
    });

    await ErrorLogger.logBotAction('track_message', message.guild.id, true, {
      messageId: message.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      expirationHours: rule.expirationHours,
    });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'messageCreate', {
      messageId: message.id,
      channelId: message.channel.id,
      serverId: message.guild?.id,
      authorId: message.author.id,
    });
  }
}
