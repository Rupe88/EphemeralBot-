import { Interaction, Events } from 'discord.js';
import { handleExpireCommand } from '../commands/expire';
import { ErrorLogger } from '../../services/ErrorLogger';

export async function handleInteractionCreate(
  interaction: Interaction
): Promise<void> {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    switch (interaction.commandName) {
      case 'expire':
        await handleExpireCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: '❌ Unknown command.',
          ephemeral: true,
        });
    }
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'interactionCreate', {
      commandName: interaction.commandName,
      serverId: interaction.guild?.id,
      userId: interaction.user.id,
    });

    // Try to reply if not already replied
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          '❌ An error occurred while processing your command. Please try again.',
        ephemeral: true,
      });
    }
  }
}
