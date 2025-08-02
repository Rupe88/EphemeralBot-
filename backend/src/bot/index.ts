import { Client, GatewayIntentBits, Events } from 'discord.js';
import { handleMessageCreate } from './events/messageCreate';
import { ErrorLogger } from '../services/ErrorLogger';
import { registerCommands } from './commands/register';
import { handleInteractionCreate } from './events/interactionCreate';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot ready! Logged in as ${client.user?.tag}`);

  try {
    await registerCommands();
    console.log('✅ Slash commands registered');
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'Bot.commandRegistration');
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handleMessageCreate(message);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'Bot.messageCreate', {
      messageId: message.id,
      channelId: message.channel.id,
      serverId: message.guild?.id,
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteractionCreate(interaction);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'Bot.interactionCreate', {
      interactionId: interaction.id,
      type: interaction.type,
      serverId: interaction.guild?.id,
    });
  }
});

client.on(Events.Error, async (error) => {
  await ErrorLogger.logError(error, 'Bot.clientError');
});

client.on(Events.Warn, (warning) => {
  console.warn(`[BOT WARNING] ${warning}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
export { client };
