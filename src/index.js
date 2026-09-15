import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { startTracker } from "./tracker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { DISCORD_TOKEN } = process.env;
if (!DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in your .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const mod = await import(`./commands/${file}`);
  client.commands.set(mod.data.name, mod);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Currently in ${client.guilds.cache.size} server(s):`);
  for (const guild of client.guilds.cache.values()) {
    console.log(`  - ${guild.name} (${guild.id})`);
  }
  startTracker(client);
  console.log("Build tracker started - polling every 30 seconds.");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing /${interaction.commandName}:`, err);
    const payload = { content: "❌ Something went wrong running that command.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(DISCORD_TOKEN);
