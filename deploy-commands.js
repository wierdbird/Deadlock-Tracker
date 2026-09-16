import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or CLIENT_ID in your .env file.");
  process.exit(1);
}

const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
  const mod = await import(`./src/commands/${file}`);
  commands.push(mod.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

try {
  if (GUILD_ID) {
    console.log(`Registering ${commands.length} commands to guild ${GUILD_ID} (instant)...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  } else {
    console.log(`Registering ${commands.length} commands globally (may take up to ~1 hour)...`);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  }
  console.log("✅ Slash commands registered successfully.");
} catch (err) {
  console.error("Failed to register commands:", err);
  process.exit(1);
}
