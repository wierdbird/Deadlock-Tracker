import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "state.json");

const DEFAULT_STATE = {
  // guildId -> { channelId }
  guilds: {},
  // appId -> last known build number (as a string, since Steam build
  // numbers can exceed safe-integer-adjacent precision concerns)
  builds: {},
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
  }
}

function readState() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      guilds: parsed.guilds ?? {},
      builds: parsed.builds ?? {},
    };
  } catch (err) {
    console.error("Failed to read state.json, resetting to defaults:", err);
    return structuredClone(DEFAULT_STATE);
  }
}

function writeState(state) {
  ensureDataFile();
  // Write to a temp file then rename, so a crash mid-write can't corrupt data.
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2));
  fs.renameSync(tmpFile, DATA_FILE);
}

export function getGuildConfig(guildId) {
  const state = readState();
  return state.guilds[guildId] ?? null;
}

export function setGuildChannel(guildId, channelId) {
  const state = readState();
  state.guilds[guildId] = { ...(state.guilds[guildId] ?? {}), channelId };
  writeState(state);
}

export function clearGuildChannel(guildId) {
  const state = readState();
  if (state.guilds[guildId]) {
    delete state.guilds[guildId].channelId;
  }
  writeState(state);
}

export function getAllGuildConfigs() {
  const state = readState();
  return state.guilds;
}

export function getLastBuild(appId) {
  const state = readState();
  return state.builds[appId] ?? null;
}

export function getAllBuilds() {
  const state = readState();
  return state.builds;
}

export function setLastBuild(appId, version) {
  const state = readState();
  state.builds[appId] = version;
  writeState(state);
}
