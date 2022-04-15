// Setup our environment variables via dotenv
require("dotenv").config();
// Import relevant classes from discord.js
// selected in the bot tab of Dev Portal
const { Client, Intents } = require("discord.js");
// Instantiate a new client with some necessary parameters.
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
// Notify progress
client.on("ready", function (e) {
  console.log(`Logged in as ${client.user.tag}!`);
});
// Authenticate
client.login(process.env.DISCORD_TOKEN);

// the actual bot content
const prefix = "!";

client.on("messageCreate", function (msg) {
  if (msg.author.bot) return; // don't reply to other bots
  if (!msg.content.startsWith(prefix)) return;
  const commandBody = msg.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase(); //returns first element of array (i.e. the command)
  const lowerCaseArgs = [];
  args.forEach((arg) => lowerCaseArgs.push(arg.toLowerCase()));

  if (command === "help") {
    msg.reply("!help, !check, !hello. That is all so far.");
  }
  if (command === "check") {
    msg.reply("yourself, before you wreck yourself!");
  }
  if (command === "hello") {
    if (lowerCaseArgs.includes("checkbot")) {
      msg.reply("hey, you there in the bushes");
    } else {
      msg.reply("sup?");
    }
  }
});
const prefixB = "#";
client.on("messageCreate", function (msg) {
  if (msg.author.bot) return; // don't reply to other bots
  if (!msg.content.startsWith(prefixB)) return;
  
});
