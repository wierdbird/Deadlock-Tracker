import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { buildStatusText } from "../statusText.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Show the currently tracked build numbers and this server's alert settings.")
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction) {
  await interaction.reply(buildStatusText(interaction.guildId));
}
