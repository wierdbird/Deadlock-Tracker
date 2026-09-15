import { APP_DEFS, POLL_INTERVAL_MS, FETCH_TIMEOUT_MS } from "./config.js";
import { extractVersion } from "./versionParser.js";
import { getLastBuild, setLastBuild, getAllGuildConfigs } from "./storage.js";

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyGuilds(client, app, oldVersion, newVersion) {
  const guildConfigs = getAllGuildConfigs();

  const oldNum = Number(oldVersion);
  const newNum = Number(newVersion);
  const increment =
    oldVersion !== null && Number.isFinite(oldNum) && Number.isFinite(newNum)
      ? newNum - oldNum
      : null;

  const incrementText = increment !== null ? (increment >= 0 ? `+${increment}` : String(increment)) : "unknown";

  const message =
    `**${app.name}** (${app.id}) build changed from \`${oldVersion}\` to \`${newVersion}\` ${incrementText}\n` +
    `link: ${app.url}`;

  for (const [guildId, cfg] of Object.entries(guildConfigs)) {
    if (!cfg?.channelId) continue;
    try {
      const guild = client.guilds.cache.get(guildId);
      const channel = guild?.channels.cache.get(cfg.channelId);
      if (channel?.isTextBased()) {
        await channel.send(message);
      }
    } catch (err) {
      console.error(`[notify] Failed to send message in guild ${guildId}:`, err.message);
    }
  }
}

async function checkApp(client, app) {
  let json;
  try {
    json = await fetchJson(app.url);
  } catch (err) {
    console.error(`[poll] ${app.name}: request failed - ${err.message}`);
    return;
  }

  const newVersion = extractVersion(json);
  if (newVersion === null) {
    console.error(`[poll] ${app.name}: could not find a version field in response`, JSON.stringify(json));
    return;
  }

  const oldVersion = getLastBuild(app.id);

  if (oldVersion === null) {
    // First time we've seen this app - just record it, don't alert.
    setLastBuild(app.id, newVersion);
    console.log(`[poll] ${app.name}: baseline build ${newVersion}`);
    return;
  }

  if (String(oldVersion) !== String(newVersion)) {
    console.log(`[poll] ${app.name}: build changed ${oldVersion} -> ${newVersion}`);
    setLastBuild(app.id, newVersion);
    await notifyGuilds(client, app, oldVersion, newVersion);
  }
}

async function checkAllApps(client) {
  await Promise.all(APP_DEFS.map((app) => checkApp(client, app)));
}

export function startTracker(client) {
  // Run once immediately on startup, then on a fixed interval.
  checkAllApps(client);
  const interval = setInterval(() => checkAllApps(client), POLL_INTERVAL_MS);
  return interval;
}

export { checkAllApps };
