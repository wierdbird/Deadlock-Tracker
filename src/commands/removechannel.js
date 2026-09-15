import { SlashCommandBuilder, PermissionFlagsBits, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { clearGuildChannel } from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("removechannel")
  .setDescription("Stop posting build-update alerts in this server.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction) {
  clearGuildChannel(interaction.guildId);
  await interaction.reply({
    content: "🛑 Build-update alerts have been disabled for this server.",
    ephemeral: true,
  });
}
