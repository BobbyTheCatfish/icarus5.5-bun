const { AugurClient } = require("augurbot-ts");
const config = require("./config/config.json");
const { AllowedMentionsTypes, Partials } = require("discord.js");
const u = require("./utils/utils");
const s = require("./database/sheets");

// eslint-disable-next-line no-console
if (!config.getMessageContent) console.log("Message content is turned off.");

// @ts-expect-error config.json includes more properties and augur doesn't like that.
const client = new AugurClient(config, {
  clientOptions: {
    allowedMentions: {
      parsed: [AllowedMentionsTypes.Role, AllowedMentionsTypes.User],
      repliedUser: true
    },
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
  },
  commands: "./modules",
  errorHandler: u.errorHandler,
  parse: u.parse,
  delayStart: () => {
    return s.loadData(client, false);
  }
});

client.login();

// LAST DITCH ERROR HANDLING
process.on("unhandledRejection", (_error, p) => p.catch(e => u.errorHandler(e, "Unhandled Rejection")));
process.on("uncaughtException", (error) => u.errorHandler(error, "Uncaught Exception"));

module.exports = client