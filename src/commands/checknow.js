import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { checkAllApps } from "../tracker.js";

export const data = new SlashCommandBuilder()
  .setName("checknow")
  .setDescription("Force an immediate check of all tracked builds.")
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  await checkAllApps(interaction.client);
  await interaction.editReply("✅ Checked all tracked builds. Run /status to see the results.");
}
