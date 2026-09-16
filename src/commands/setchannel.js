import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { setGuildChannel } from "../storage.js";
import { buildStatusText } from "../statusText.js";

export const data = new SlashCommandBuilder()
  .setName("setchannel")
  .setDescription("Set the channel where build-update alerts will be posted.")
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The text channel to post alerts in")
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  // Only usable where the bot is actually a member of the server - not via
  // Discord's "user install" feature, which would let someone run this in a
  // server the bot was never invited to, where interaction.guild is null.
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction) {
  const partialChannel = interaction.options.getChannel("channel");
  setGuildChannel(interaction.guildId, partialChannel.id);

  // interaction.guild can briefly be null right after the bot starts up,
  // before Discord finishes sending over the guild cache. Fall back to
  // fetching it directly from the API in that case instead of crashing.
  const guild = interaction.guild ?? (await interaction.client.guilds.fetch(interaction.guildId).catch(() => null));

  // channel from getChannel() with addChannelTypes restrictions is a partial
  // resolved-data object, not a full Channel instance, so it has no working
  // toString() mention and isn't guaranteed to have .send(). Resolve the
  // real channel object instead (cache first, then fetch as a fallback).
  const channel =
    guild?.channels.cache.get(partialChannel.id) ??
    (await guild?.channels.fetch(partialChannel.id).catch(() => null));

  const mention = `<#${partialChannel.id}>`;
  const statusText = buildStatusText(interaction.guildId);
  const announcement = `Now tracking in ${mention}\n\n${statusText}`;

  // Post the tracking announcement directly in the newly configured channel...
  if (channel?.isTextBased()) {
    await channel.send(announcement).catch((err) => {
      console.error(`[setchannel] Failed to post announcement in ${partialChannel.id}:`, err.message);
    });
  } else {
    console.error(`[setchannel] Could not resolve channel ${partialChannel.id} to post the announcement.`);
  }

  // ...and give a short acknowledgement wherever the command was actually run,
  // in case that's a different channel.
  await interaction.reply({
    content: `✅ Alerts will be posted in ${mention}.`,
    ephemeral: true,
  });
}
