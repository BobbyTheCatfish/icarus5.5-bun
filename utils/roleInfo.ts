// @ts-check
import { GuildMember, Role } from "discord.js";
import u from "./utils";

type EquipRole = {
  baseId: string;
  inherited: string[];
  colorId: string;
}

/**
 * Get the roles that a given member can equip
 */
function getInventory(member: GuildMember, override = true) {
  const equipRoles = u.db.sheets.roles.equip;
  if (override && u.perms.calc(member, ["mgmt"])) return equipRoles;
  return equipRoles.filter(r => member.roles.cache.hasAny(r.base.id, ...r.parents));
}

/**
 * null = no role, true = success, false = not equipable
 */
async function equip(member: GuildMember, baseName: string | null, baseId?: string) {
  const allColors = u.db.sheets.roles.equip.map(r => r.color.id).filter(r => member.roles.cache.has(r));
  const inventory = getInventory(member);

  if (!baseName && !baseId) {
    await member.roles.remove(allColors);
    return true;
  }

  let role: (import("../types/sheetTypes").Role & { color: Role; }) | undefined;
  if (baseId) {
    role = u.db.sheets.roles.equip.get(baseId);
  } else if (baseName) {
    role = u.db.sheets.roles.equip.find(r => r.base.name.toLowerCase() === baseName.toLowerCase());
  }

  // role doesn't exist
  if (!role) return null;

  // role isn't in their inventory
  if (!inventory.has(role.base.id)) return false;

  // nothing changed
  if (member.roles.cache.has(role.color.id)) return true;

  // swap colors
  const removal = allColors.filter(c => c !== role.color.id);
  if (removal.length > 0) await member.roles.remove(removal);
  await member.roles.add(role.color.id);
  return true;
}

export default { equip, getInventory }