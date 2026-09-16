import { APP_DEFS } from "./config.js";
import { getAllBuilds, getGuildConfig } from "./storage.js";

/**
 * Builds the plain-text "current tracking status" block used by both
 * /status and the /setchannel confirmation message.
 */
export function buildStatusText(guildId) {
  const builds = getAllBuilds();
  const cfg = getGuildConfig(guildId);

  const lines = ["**Tracking status**"];

  for (const app of APP_DEFS) {
    const build = builds[app.id];
    const buildText = build !== undefined ? `\`${build}\`` : "not checked yet";
    lines.push(`**${app.name}** \`${app.id}\`: build ${buildText}`);
  }

  //lines.push("");
  //lines.push(cfg?.channelId ? `Alert channel: <#${cfg.channelId}>` : "Alert channel: not set (use /setchannel)");

  return lines.join("\n");
}
