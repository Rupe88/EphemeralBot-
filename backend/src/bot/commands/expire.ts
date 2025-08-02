import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { ChannelRule } from '../../models/ChannelRule';
import { Server } from '../../models/Server';
import { ErrorLogger } from '../../services/ErrorLogger';

export const expireCommand = new SlashCommandBuilder()
  .setName('expire')
  .setDescription('Manage message expiration')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('setup')
      .setDescription('Setup auto-expiration for a channel')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel to setup')
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName('hours')
          .setDescription('Hours until expiration')
          .setRequired(true)
          .addChoices(
            { name: '1 hour', value: 1 },
            { name: '6 hours', value: 6 },
            { name: '24 hours', value: 24 },
            { name: '7 days', value: 168 }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('status').setDescription('Show expiration status')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('stop')
      .setDescription('Stop auto-expiration for a channel')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel to stop')
          .setRequired(true)
      )
  );

export async function handleExpireCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'setup':
        await handleSetup(interaction);
        break;
      case 'status':
        await handleStatus(interaction);
        break;
      case 'stop':
        await handleStop(interaction);
        break;
    }
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'expireCommand', {
      subcommand,
      serverId: interaction.guild?.id,
      userId: interaction.user.id,
    });

    await interaction.reply({
      content:
        '❌ An error occurred while processing your command. Please try again.',
      ephemeral: true,
    });
  }
}

async function handleSetup(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.options.getChannel('channel');
  const hours = interaction.options.getInteger('hours')!;

  // Validate channel type
  if (channel?.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: '❌ Please select a text channel!',
      ephemeral: true,
    });
    return;
  }

  // Check subscription limits
  const server = await Server.findOne({ serverId: interaction.guild.id });
  const existingRules = await ChannelRule.countDocuments({
    serverId: interaction.guild.id,
    isActive: true,
  });

  if (!server?.subscription || server.subscription === 'free') {
    if (existingRules >= 1) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Free Plan Limit Reached')
        .setDescription(
          'Your free plan allows only **1 channel**. Upgrade to Premium for unlimited channels!'
        )
        .addFields(
          {
            name: 'Current Usage',
            value: `${existingRules}/1 channels`,
            inline: true,
          },
          { name: 'Premium Price', value: '$6/month', inline: true }
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Upgrade to Premium')
          .setStyle(ButtonStyle.Link)
          .setURL('https://ephemeralbot.com/pricing')
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
      return;
    }
  }

  // Create/update rule
  await ChannelRule.findOneAndUpdate(
    { serverId: interaction.guild.id, channelId: channel.id },
    {
      serverId: interaction.guild.id,
      channelId: channel.id,
      channelName: channel.name,
      expirationHours: hours,
      isActive: true,
      createdAt: new Date(),
      createdBy: interaction.user.id,
    },
    { upsert: true }
  );

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle('✅ Setup Complete!')
    .setDescription(
      `Messages in ${channel} will now expire after **${hours} hours**`
    )
    .addFields(
      { name: 'Channel', value: `#${channel.name}`, inline: true },
      { name: 'Expiration', value: `${hours} hours`, inline: true },
      {
        name: 'Dashboard',
        value: '[Manage Rules](https://ephemeralbot.com/dashboard)',
        inline: true,
      }
    )
    .setFooter({ text: 'EphemeralBot - Keep your Discord clean!' });

  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const rules = await ChannelRule.find({
    serverId: interaction.guild.id,
    isActive: true,
  });

  if (rules.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('📋 No Active Rules')
      .setDescription(
        'No active expiration rules in this server.\n\nUse `/expire setup` to create your first rule!'
      )
      .setFooter({ text: 'EphemeralBot - Keep your Discord clean!' });

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const rulesList = rules
    .map((rule) => {
      const channel = interaction.guild?.channels.cache.get(rule.channelId);
      return `• ${channel ? `#${channel.name}` : `#${rule.channelName}`}: **${
        rule.expirationHours
      }h**`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle('📋 Active Expiration Rules')
    .setDescription(rulesList)
    .addFields(
      { name: 'Total Rules', value: `${rules.length}`, inline: true },
      {
        name: 'Dashboard',
        value: '[Manage Rules](https://ephemeralbot.com/dashboard)',
        inline: true,
      }
    )
    .setFooter({ text: 'Use /expire stop to disable • EphemeralBot' });

  await interaction.reply({ embeds: [embed] });
}

async function handleStop(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.options.getChannel('channel');

  if (channel?.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: '❌ Please select a text channel!',
      ephemeral: true,
    });
    return;
  }

  const rule = await ChannelRule.findOne({
    serverId: interaction.guild.id,
    channelId: channel.id,
    isActive: true,
  });

  if (!rule) {
    await interaction.reply({
      content: `❌ No active expiration rule found for ${channel}.`,
      ephemeral: true,
    });
    return;
  }

  // Deactivate the rule
  await ChannelRule.findByIdAndUpdate(rule._id, {
    isActive: false,
  });

  const embed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle('🛑 Rule Stopped')
    .setDescription(`Auto-expiration has been disabled for ${channel}`)
    .addFields(
      { name: 'Channel', value: `#${channel.name}`, inline: true },
      { name: 'Previous Rule', value: `${rule.expirationHours}h`, inline: true }
    )
    .setFooter({
      text: 'Use /expire setup to create new rules • EphemeralBot',
    });

  await interaction.reply({ embeds: [embed] });
}
