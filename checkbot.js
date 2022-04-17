// Setup our environment variables via dotenv
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Import relevant classes from discord.js
// selected in the bot tab of Dev Portal
const { Client, Intents } = require("discord.js");

// Instantiate a new client with some necessary parameters.
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
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
  const tokens = commandBody.split(" ");
  const command = tokens.shift().toLowerCase(); //returns first element of array (i.e. the command)
  const lowerCaseTokens = [];
  tokens.forEach((token) => lowerCaseTokens.push(token.toLowerCase()));

  if (command === "help") {
    msg.reply("!help, !check, !hello. That is all so far.");
  }
  if (command === "check") {
    msg.reply("yourself, before you wreck yourself!");
  }
  if (command === "hello") {
    if (lowerCaseTokens.includes("checkbot")) {
      msg.reply("hey, you there in the bushes");
    } else {
      msg.reply("sup?");
    }
  }
});
const prefixB = "#";
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return; // don't reply to other bots
  const tokens = msg.content.split(" ");

  // if the first word is #gif, fetch gif results with following words
  if (tokens[0] === "#gif") {
    // combines the words after #gif into a long string, no spaces
    const keywords = tokens.slice(1, tokens.length).join(" ");
    // this combo of words is added to create the api endpoint
    const url = `https://api.tenor.com/v1/search?q=${keywords}&key=${process.env.TENOR_KEY}&limit=10`;

    // fetch the results
    const response = await fetch(url);
    const result = await response.json();
    // const index = Math.floor(Math.random() * result.results.length);
    msg.channel.send(result.results[0].url);
  }
});
