// @ts-check
import { GuildMember } from "discord.js";
import config from "../config/config.json";
import snowflakes from "../config/snowflakes.json"
import tsf from "../config/snowflakes-testing.json"

// circular dependancy, had to duplicate code :(
const sf = config.devMode ? tsf : snowflakes;

export type Perm = (m: GuildMember) => boolean

const permFuncs = {
  botOwner: (m: GuildMember) => config.ownerId === m.id,
  botAdmin: (m: GuildMember) => config.adminId.includes(m.id) || permFuncs.botOwner(m),
  destinyAdmin: (m: GuildMember) => m.roles.cache.has(sf.roles.destiny.clansAdmin),
  destinyManager: (m: GuildMember) => m.roles.cache.has(sf.roles.destiny.clansManager),
  destinyValiantAdmin: (m: GuildMember) => m.roles.cache.has(sf.roles.destiny.valiantAdmin),
  mgmt: (m: GuildMember) => m.roles.cache.has(sf.roles.team.management) || (config.ownerOverride && permFuncs.botOwner(m)),
  mgr: (m: GuildMember) => m.roles.cache.has(sf.roles.team.manager),
  mod: (m: GuildMember) => m.roles.cache.has(sf.roles.team.mod),
  mcMod: (m: GuildMember) => m.roles.cache.has(sf.roles.team.minecraftMod),
  botTeam: (m: GuildMember) => m.roles.cache.has(sf.roles.team.botTeam),
  team: (m: GuildMember) => m.roles.cache.has(sf.roles.team.team),
  volunteer: (m: GuildMember) => m.roles.cache.has(sf.roles.team.volunteer),
  inHouse: (m: GuildMember) => m.roles.cache.hasAny(sf.roles.houses.housebb, sf.roles.houses.housefb, sf.roles.houses.housesc),
  trustPlus: (m: GuildMember) => m.roles.cache.has(sf.roles.moderation.trustedPlus),
  trusted: (m: GuildMember) => m.roles.cache.has(sf.roles.moderation.trusted),
  notMuted: (m: GuildMember) => !m.roles.cache.hasAny(sf.roles.moderation.muted, sf.roles.moderation.ductTape),
  everyone: (m: GuildMember) => true
};

const perms = {
  /** Perform a check to see if a user has specific roles. Bot Owner and MGMT always bypass. */
  calc: (member: GuildMember, permArr: (keyof typeof permFuncs)[]) => {
    if (!member) return false;
    permArr.push("mgmt");
    for (const perm of new Set(permArr)) {
      const p = permFuncs[perm];
      if (p && p(member)) return true;
    }
    return false;
  },
  isOwner: (m: GuildMember | null | undefined) => m && permFuncs.botOwner(m),

  inHouse: (m: GuildMember | null | undefined) => m && permFuncs.inHouse(m),

};

export default perms;
export type PermKeys = keyof typeof permFuncs