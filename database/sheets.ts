// @ts-check
import { GoogleSpreadsheet } from "google-spreadsheet";
import config from "../config/config.json";
import { JWT } from "google-auth-library";
import type types from "../types/sheetTypes";
import sf from "../utils/snowflakes";
import { setBadgeData } from "../utils/badges";
import Schemas from "google-spreadsheet-schema";
import type { Client } from "discord.js";

let client: Client;

function makeDocument(sheetId?: string) {
  const keys = config.google.creds;
  const auth = {
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  };
  const account = new JWT(auth);
  const sheet = new GoogleSpreadsheet(sheetId ?? config.google.sheets.config, account);
  return sheet;
}

function getServer() {
  return client?.guilds.cache.get(sf.ldsg);
}

const sheetMap = {
  games: "",
  igns: "IGN",
  optRoles: "Opt-In Roles",
  missionaries: "Mail",
  roles: "Roles",
  sponsors: "Sponsor Channels",
  starboards: "Starboards",
  tourneyChampions: "Tourney Champions",
  vcNames: "Voice Channel Names",
  xpSettings: "XP Settings",
  wipChannels: "WIP Channel Defaults",
  siteSurvey: "Site Feedback"
};

export const functionSchemas: {
  optRoles: Schemas.Mapper<types["OptRole"]>,
  wipChannels: Schemas.Mapper<types["PlayingDefault"]>,
  sponsors: Schemas.Mapper<types["Sponsor"]>,
  starboards: Schemas.Mapper<types["Starboard"]>,
  rolesBase: Schemas.Mapper<types["Role"]>,
  colorRole: Schemas.Mapper<types["ColorRole"]>,
  levelRole: Schemas.Mapper<types["LevelStrRole"]>
  numRole: Schemas.Mapper<types["LevelNumRole"]>
} = {
  optRoles: (row) => {
    const id = row.get("RoleID");
    const role = getServer()?.roles.cache.get(id);
    if (!role) throw new Error(`Sheet Error - Missing Opt-Role: ${row.rowNumber} (${id})`);
    return {
      name: row.get("Role Tag"),
      badge: row.get("Badge") || null,
      badgeLore: row.get("Badge Lore") || null,
      role
    };
  },
  wipChannels: (row) => {
    const id = row.get("ChannelId");
    const channel = getServer()?.channels.cache.get(id);
    if (!channel) throw new Error(`Sheet Error - Missing WIP Channel: ${row.rowNumber} (${id}, <#${id}>)`);
    return {
      channelId: id,
      name: row.get("Game Name")
    };
  },
  sponsors: (row) => {
    const date = new Date(row.get("Archive At"));
    const cId = row.get("Channel");
    const channel = client?.getTextChannel(cId);
    if (cId && !channel) throw new Error(`Sheet Error - Missing Sponsor Channel: Row ${row.rowNumber}, ${cId}`);
    return {
      userId: row.get("Sponsor"),
      channel,
      emojiId: row.get("Emoji") || null,
      enabled: row.get("Enabled") === "TRUE",
      archiveAt: isNaN(date.valueOf()) ? null : date
    };
  },
  starboards: (row) => {
    const cId = row.get("ChannelID");
    const channel = client.getTextChannel(cId);
    if (!channel) throw new Error(`Sheet Error - Missing Starboard Channel: Row ${row.rowNumber}, ${cId}`);
    return {
      approval: row.get("Approval") === "TRUE",
      channel,
      priorityChannels: new Set(row.get("PriorityChannels")?.split(", ") || []),
      priorityEmoji: new Set(row.get("Reactions")?.split(", ") || []),
      threshold: parseInt(row.get("Threshold")),
    };
  },
  rolesBase: (row) => {
    const baseId = row.get("Base Role ID");
    const colorId = row.get("Color Role ID");
    const base = getServer()?.roles.cache.get(baseId);
    const color = getServer()?.roles.cache.get(colorId) || null;

    if (!base) throw new Error(`Sheet Error - Missing Role: Row ${row.rowNumber}, ${baseId}`);
    if (colorId && !color) throw new Error(`Sheet Error - Missing Color Role: Row ${row.rowNumber}, ${colorId}`);
    return {
      type: row.get("Type"),
      base,
      color: color,
      parents: row.get("Parent Roles")?.split(" ").filter((a: string) => noBlank(a)) ?? [],
      level: row.get("Level") || null,
      badge: row.get("Badge") || null,
      badgeLore: row.get("Badge Lore") || null
    };
  },
  colorRole: (row) => {
    const base = functionSchemas.rolesBase(row);
    const color = base.color;
    if (!color) throw new Error(`Sheet Error - Missing Color Role: Row ${row.rowNumber}`);
    return { ...base, color };
  },
  levelRole: (row) => {
    const base = functionSchemas.rolesBase(row);
    const level = base.level;
    if (!level) throw new Error(`Sheet Error - Missing Level: Row ${row.rowNumber}`);
    return { ...base, level: level };
  },
  numRole: (row) => {
    const base = functionSchemas.levelRole(row);
    return { ...base, level: parseInt(base.level) };
  }
};

export const data = {
  docs: {
    config: makeDocument(),
    games: makeDocument(config.google.sheets.games)
  },

  games: {
    purchased: new Schemas.ObjectSchema("code", {
      title: { key: "Title" },
      system: { key: "System" },
      rating: { key: "Rating", defaultValue: "E" },
      cost: { key: "Cost", type: "number" },
      code: { key: "Code" },
      key: { key: "Key" },
      steamId: { key: "Steam ID" },
      recipient: { key: "Recipient ID", possiblyNull: true },
      date: { key: "Date", type: "date", possiblyNull: true }
    }),
    available: new Schemas.ObjectSchema("code", {
      title: { key: "Title" },
      system: { key: "System" },
      rating: { key: "Rating", defaultValue: "E" },
      cost: { key: "Cost", type: "number" },
      code: { key: "Code" },
      key: { key: "Key" },
      steamId: { key: "Steam ID" },
    })
  },

  igns: new Schemas.ObjectSchema("system", {
    aliases: { key: "Aliases", splitter: " " },
    category: { key: "Category", defaultValue: "Game Platforms" },
    link: { key: "Link", possiblyNull: true },
    name: { key: "Name" },
    system: { key: "System" }
  }),

  missionaries: new Schemas.ObjectSchema("userId", {
    userId: { key: "UserId" },
    email: { key: "Email" }
  }),

  tourneyChampions: new Schemas.ObjectSchema("key", {
    tourneyName: { key: "Tourney Name" },
    userId: { key: "User ID" },
    takeAt: { key: "Take Role At", type: "date" },
    key: { key: "Key" }
  }),

  vcNames: new Schemas.ArraySchema("Name"),

  starboards: {
    boards: new Schemas.SchemaFunction("ChannelID", functionSchemas.starboards),
    banned: {
      channels: new Schemas.SetSchema("Excluded Channel IDs", "string"),
      emoji: new Schemas.SetSchema("Excluded Emoji IDs", "string")
    }
  },

  xpSettings: {
    banned: new Schemas.SetSchema("BannedEmoji", "string"),
    channels: new Schemas.ObjectSchema("channelId", {
      posts: { key: "PostMultiplier", type: "number", defaultValue: 1 },
      channelId: { key: "ChannelId" },
      emoji: { key: "Emoji", splitter: ", ", type: "stringSet" },
      preferMedia: { key: "PreferMedia", type: "boolean", defaultValue: false }
    })
  },

  roles: {
    all: new Schemas.SchemaFunction("Base Role ID", functionSchemas.rolesBase),
    team: new Schemas.SchemaFunction("Base Role ID", functionSchemas.levelRole) as Schemas.SchemaFunction<"string", Omit<types["LevelStrRole"], "level"> & { level: import("../utils/perms").PermKeys }>,
    equip: new Schemas.SchemaFunction("Base Role ID", functionSchemas.colorRole),
    rank: new Schemas.SchemaFunction("Level", functionSchemas.numRole, "number"),
    year: new Schemas.SchemaFunction("Level", functionSchemas.numRole, "number"),
  },

  optRoles: new Schemas.SchemaFunction("RoleID", functionSchemas.optRoles),
  sponsors: new Schemas.SchemaFunction("Sponsor", functionSchemas.sponsors),
  wipChannels: new Schemas.SchemaFunction("ChannelId", functionSchemas.wipChannels),
  siteSurvey: new Schemas.SetSchema("NOT A REAL COLUMN")
};


async function setData(sheet: keyof Omit<typeof data, "docs">, doc: GoogleSpreadsheet) {
  if (sheet === "games") {
    const worksheet = doc.sheetsByIndex[0]!;
    const rows = await worksheet.getRows();

    await data.games.available.load(worksheet, (row) => !row.get("Recipient ID") && !row.get("Date"), rows);
    await data.games.purchased.load(worksheet, (row) => row.get("Recipient ID") || row.get("Date"), rows);
    return;
  }

  const worksheet = doc.sheetsByTitle[sheetMap[sheet]]!;

  if (sheet === "xpSettings") {
    const rows = await worksheet.getRows();

    await data.xpSettings.banned.load(worksheet, undefined, rows);
    await data.xpSettings.channels.load(worksheet, undefined, rows);
    return;
  }

  if (sheet === "roles") {
    const rows = await worksheet.getRows();

    await data.roles.all.load(worksheet, (row) => row.get("Type") !== "Comment", rows);
    await data.roles.equip.load(worksheet, (row) => row.get("Color Role ID"), rows);
    await data.roles.rank.load(worksheet, (row) => row.get("Type") === "Rank", rows);
    await data.roles.team.load(worksheet, (row) => row.get("Type") === "Team Assign", rows);
    await data.roles.year.load(worksheet, (row) => row.get("Type") === "Year", rows);
    return;
  }

  if (sheet === "starboards") {
    const rows = await worksheet.getRows();

    await data.starboards.boards.load(worksheet, undefined, rows);
    await data.starboards.banned.channels.load(worksheet, undefined, rows);
    await data.starboards.banned.emoji.load(worksheet, undefined, rows);
    return;
  }

  await data[sheet].load(worksheet);
}

export async function loadData(cli: Client, loggedIn = true, justRows = false, sheet?: keyof Omit<typeof data, "docs">) {
  client = cli;
  loggedIn; // remove if the change worked
  if (!data.docs) throw new Error("Something has gone terribly wrong during sheets loadData");

  if (!justRows) {
    await data.docs.config.loadInfo();
    await data.docs.games.loadInfo();
  }

  const conf = data.docs.config;
  const games = data.docs.games;

  if (sheet) {
    if (sheet === "games") {
      await setData(sheet, games);
      return data;
    }

    await setData(sheet, conf);
    if (["roles", "optRoles"].includes(sheet)) setBadgeData(data.optRoles, data.roles);
    return data;
  }

  const promises: Promise<void>[] = [];
  for (const key in sheetMap) {
    // @ts-ignore
    const typeCorrectKey: keyof typeof sheetMap = key;
    if (typeCorrectKey === "games") {
      promises.push(setData(typeCorrectKey, games));
    } else {
      promises.push(setData(typeCorrectKey, conf));
    }
  }
  await Promise.all(promises);
  setBadgeData(data.optRoles, data.roles);
  return data;
}

const blank = ["", undefined, null];

function noBlank(e: any, key?: string) {
  if (key && typeof e === "object") return !blank.includes(e[key]);
  return !blank.includes(e);
}

export default {
  loadData,
  data,
  schemas: functionSchemas
};