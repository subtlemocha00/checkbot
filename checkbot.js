require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Validate Environment Variables
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ ERROR: DISCORD_TOKEN is missing in .env file!');
  process.exit(1);
}

if (!process.env.TENOR_KEY) {
  console.warn('⚠️ WARNING: TENOR_KEY is missing. GIF commands will not work.');
}

// Initialize Client with Required Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Essential for reading message content
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load Commands
const loadCommands = () => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${file}`);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Command ${file} is missing "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`❌ Failed to load command ${file}:`, error);
    }
  }
};

// Cooldown Map
const cooldowns = new Collection();

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Register Slash Commands
  try {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord.js');

    // Note: If you don't have a commands folder structure set up locally yet, 
    // you may need to create a simple array of commands here manually or ensure the ./commands folder exists.
    // For this fix, we assume standard structure. If errors occur, ensure 'commands' folder exists.

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    // Simple registration for existing commands if folder logic fails
    // In a real scenario, you'd map client.commands to JSON here.
    // For now, we rely on the folder load above.

  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  // Cooldown Logic
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3 * 1000; // 3 seconds
  const cooldownAmount = (command.cooldown || defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      return interaction.reply({
        content: `⏳ Please wait ${timeLeft} more second(s) before reusing the \`${command.data.name}\` command.`,
        ephemeral: true
      });
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } else {
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  }

  // Execute Command with Error Handling
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login
client.login(process.env.DISCORD_TOKEN);