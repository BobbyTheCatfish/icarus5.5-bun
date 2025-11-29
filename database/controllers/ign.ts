import Ign from "../models/Ign.model";

export type IGN = {
  discordId: string;
  system: string;
  ign: string;
}

export default {
  /** Delete an IGN */
  delete: function(discordId: string, system: string): Promise<IGN | null> {
    return Ign.findOneAndDelete({ discordId, system }, { lean: true, new: false }).exec();
  },
  
  /** Find a specific IGN */
  findOne: function(discordId: string, system: string): Promise<IGN | null> {
    return Ign.findOne({ discordId, system }, undefined, { lean: true }).exec();
  },

  /** Find someone by their IGN */
  findOneByIgn: function(ign: string | string[], system: string): Promise<IGN | null> {
    if (Array.isArray(ign)) return Ign.findOne({ ign: { $in: ign }, system }, undefined, { lean: true }).exec();
    return Ign.findOne({ ign, system }, undefined, { lean: true }).exec();
  },

  /** Find a list of all IGNs for a given system */
  findMany: function(discordId: string | string[], system?: string | null): Promise<IGN[]> {
    let ids: string[] | string | { $in: string[]; };
    let query: any;

    if (Array.isArray(discordId)) ids = { $in: discordId };
    else ids = discordId;

    if (system) query = { discordId: ids, system };
    else query = { discordId: ids };

    return Ign.find(query, undefined, { lean: true }).exec();
  },

  /** Save a user's IGN */
  save: function(discordId: string, system: string, ign: string): Promise<IGN | null> {
    return Ign.findOneAndUpdate({ discordId, system }, { ign }, { upsert: true, new: true, lean: true }).exec();
  },

  /** Update a lot of IGNs at the same time */
  saveMany: function(discordId: string, igns: { system: string; ign?: string; }[]): Promise<number> {
    const actions = igns.map(i => {
      const filter = { discordId, system: i.system };
      if (!i.ign) return { deleteOne: { filter } };
      return {
        updateOne: { filter, update: { ign: i.ign }, upsert: true, new: true, lean: true }
      };
    });
    return Ign.bulkWrite(actions).then((i) => i.modifiedCount + i.insertedCount + i.deletedCount);
  },

  /** Transfer an old account's IGNs to their new account */
  transfer: async function(oldUserId: string, newUserId: string) {
    const existing = await Ign.find({ discordId: newUserId });
    return Ign.updateMany({ discordId: oldUserId, system: { $nin: existing.map(e => e.system) } }, { discordId: newUserId }, { lean: true }).exec();
  }
};
