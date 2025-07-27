// Gets the badges that belong to the user based on a list of roles.
import { Collection, Role } from "discord.js";
import fs from "fs"
import config from "../config/config.json"

type Badge = {
  image: string;
  overrides: string[];
  lore: string;
}

const badges = new Collection<string, Badge>();
export function setBadgeData(optRoles: typeof import("../database/sheets").data.optRoles, roles: typeof import("../database/sheets").data.roles) {
  badges.clear();

  for (const [id, role] of roles.all) {
    // Only add to the map...
    if (!role.badge || // if they have a badge listed
      !fs.existsSync(`${config.badgePath}/${role.badge}.png`) // and if the badge path is valid
    ) continue;

    badges.set(id, {
      image: `${role.badge}.png`,
      // roles that have a higher level badge than this one
      overrides: role.parents.filter(r => roles.all.get(r)?.badge),
      lore: role.badgeLore || ""
    });
  }

  for (const [id, role] of optRoles) {
    // See above for documentation of what this statement means
    if (!role.badge || !fs.existsSync(`${config.badgePath}/${role.badge}.png`)) continue;

    badges.set(id, {
      image: `${role.badge}.png`,
      lore: role.badgeLore || "",
      overrides: []
    });
  }
}

/**
 * Based on the list of roles inserted, return the list of badge objects that the member
 * should have on their profile card.
 */
export function getBadges(roles: Collection<string, Role>): (Badge & { name: string; })[] {
  const guild = roles.first()?.guild;

  return badges.filter((b, id) => roles.has(id) && !roles.hasAny(...b.overrides))
    .map((r, id) => {
      const name = guild?.roles.cache.get(id)?.name ?? "";
      return { ...r, name };
    });
}

export default { getBadges, setBadgeData };
