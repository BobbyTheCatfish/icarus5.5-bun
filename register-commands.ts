/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import Discord from "discord.js";
import axios, { AxiosError } from "axios";
import config from "./config/config.json";
import sf from "./utils/snowflakes.ts";

/************************
 * BEGIN "CONFIG" BLOCK *
 ************************/

const globalCommandFiles = [
  "messageBookmark.js",
  "slashAvatar.js",
  "slashFun.js",
  "slashHelp.js"
];

const guildCommandFiles = [
  "messageMod.js",
  "messageEdit.js",
  "slashBank.js",
  "slashBot.js",
  "slashClockwork.js",
  "slashGame.js",
  "slashGospel.js",
  "slashIgn.js",
  "slashLdsg.js",
  "slashManagement.js",
  "slashManager.js",
  "slashMissionary.js",
  "slashMod.js",
  "slashRank.js",
  "slashRole.js",
  "slashSponsor.js",
  "slashTag.js",
  "slashTeam.js",
  "slashTournaments.js",
  "slashUser.js",
  "slashVoice.js",
  "userMod.js"
];

/**********************
 * END "CONFIG" BLOCK *
 **********************/

type RegisteredCommand = {
  type: number
  id: string
  name: string
}

type RegFile = Discord.RESTPostAPIChatInputApplicationCommandsJSONBody | Discord.RESTPostAPIContextMenuApplicationCommandsJSONBody

function getCommandType(typeId: number) {
  switch (typeId) {
    case 1: return "slash";
    case 2: return "user";
    case 3: return "message";
    default: return typeId;
  }
}

function displayError(error: AxiosError) {
  if (error.response) {
    if (error.response.status === 429) {
      console.log("You're being rate limited! try again after " + (error.response.data as any).retry_after + " seconds. Starting countdown...");
      setTimeout(() => {
        console.log("try now!");
        process.exit();
      }, (error.response.data as any).retry_after * 1000);
    } else if (error.response.status === 400) {
      console.log("You've got a bad bit of code somewhere! Unfortunately it won't tell me where :(");
    } else if (error.response.status === 401) {
      console.log("It says you're unauthorized...");
    } else {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
    console.trace(error);
  }
  process.exit();
}

async function patch(filepaths: string[], global: boolean) {

  const commandPath = path.resolve(process.cwd() === __dirname ? __dirname : process.cwd(), "./registry");
  // const commandPath = path.resolve(process.cwd(), "./registry");
  console.log(commandPath)
  const data: RegFile[] = [];
  for (const file of filepaths) {
    const load: RegFile = (await import(path.resolve(commandPath, file))).default;
    data.push(load);
  }
  const registered: { data: RegisteredCommand[] } | void = await axios({
    method: "put",
    url: `https://discord.com/api/v8/applications/${config.applicationId}${global ? "" : `/guilds/${sf.ldsg}`}/commands`,
    headers: { Authorization: `Bot ${config.token}` },
    data
  }).catch(displayError);

  if (registered) {
    console.log(`\n=====${global ? "Global" : "Guild"} commands registered=====`);
    const cmds = registered.data;
    console.log(cmds.map(c => {
      const commandType = getCommandType(c.type);
      return `${c.name} (${commandType}): ${c.id}`;
    }).join("\n"));
  }

  return registered?.data;
}

async function register() {
  const applicationId = config.applicationId;
  if (!applicationId) return console.log("Please put your application ID in config/config.json\nYou can find the ID here:\nhttps://discord.com/developers/applications");

  const guild = await patch(guildCommandFiles, false) ?? [];
  const global = await patch(globalCommandFiles, true) ?? [];

  const commands: Record<string, string> = Object.fromEntries(
    global.concat(guild)
      // turn into camel case
      .map(cmd => {
        const name = cmd.name.split(" ")
          .map(n => n[0].toUpperCase() + n.slice(1).toLowerCase())
          .join("");
        return [`${getCommandType(cmd.type)}${name}`, cmd.id];
      })
      .sort((a, b) => a[0].localeCompare(b[0]))
  );

  fs.writeFileSync(path.resolve(__dirname, "./config/snowflakes-commands.json"), JSON.stringify({ commands }, null, 2));

  // write new example file commands only if there are new ones
  // this prevents weirdness with git
  const oldExample = (await import("./config/snowflakes-commands-example.json")).default;
  const oldKeys = Object.keys(oldExample.commands);
  const newKeys = Object.keys(commands);
  const diff = oldKeys.filter(c => !newKeys.includes(c)).concat(newKeys.filter(c => !oldKeys.includes(c)));

  if (diff.length > 0) fs.writeFileSync(path.resolve(__dirname, "./config/snowflakes-commands-example.json"), JSON.stringify({ commands: Object.fromEntries(newKeys.map(f => [f, ""])) }, null, 2));

  console.log("\nCommand snowflake files updated\n");
  process.exit();
}
console.log(process.versions.bun)


if (process.cwd() === __dirname) {
  register();
}

export default register