import { REST, Routes } from 'discord.js';
import { expireCommand } from './expire';

const commands = [expireCommand.toJSON()];

export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log('🔄 Started refreshing application (/) commands.');

    // Register commands globally
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body: commands,
    });

    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    throw error;
  }
}
