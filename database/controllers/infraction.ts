import moment from 'moment-timezone';
import Discord from "discord.js";
import Infraction from "../models/Infraction.model"

type Infraction = {
  discordId: string;
  mod: string;
  value: number;
  timestamp: Date;
  channel?: string | null;
  message?: string | null;
  flag?: string | null;
  description?: string | null;
  handler?: string | null;
}

const outdated = "Expected a Discord ID but likely recieved an object instead. That's deprecated now!";

export default {

  /** Get an infraction by its associated mod flag. */
  getByFlag: function(flagId: string): Promise<Infraction | null> {
    if (typeof flagId !== "string") throw new TypeError(outdated);
    return Infraction.findOne({ flag: flagId }, undefined, { lean: true }).exec();
  },
  /** Get an infraction by its associated mod flag. */
  getByMsg: function(message: string): Promise<Infraction | null> {
    if (typeof message !== "string") throw new TypeError(outdated);
    return Infraction.findOne({ message }, undefined, { lean: true }).exec();
  },
  /** Get a summary of a user's infractions. */
  getSummary: async function(discordId: string, time: number = 28) {
    if (typeof discordId !== "string") throw new TypeError(outdated);
    const since = moment().tz("America/Denver").subtract(time, "days");
    /** @type {Infraction[]} */
    // -1 is cleared, 0 is unhandled
    return Infraction.find({ discordId, timestamp: { $gte: since }, value: { $gt: 0 } }, undefined, { lean: true }).exec()
      .then((records: Infraction[]) => ({
        discordId,
        count: records.length,
        points: records.reduce((c, r) => c + r.value, 0),
        time,
        detail: records
      }));
  },
  /** Get the infraction counts for different users */
  getCounts: async function(discordIds: string[], time: number = 28): Promise<Discord.Collection<string, number>> {
    if (!Array.isArray(discordIds)) throw new TypeError("discordIds must be an array of IDs");
    const since = moment().tz("America/Denver").subtract(time, "days");
    const records = await Infraction.aggregate([
      { $match: { timestamp: { $gte: since }, value: { $gt: 0 } } },
      { $group: { _id: "$discordId", count: { $sum: 1 } } }
    ]).exec();
    return new Discord.Collection(records.map(r => [r._id, r.count]));
  },
  /** Remove/delete an infraction */
  remove: function(flag: string): Promise<Infraction | null> {
    if (typeof flag !== "string") throw new TypeError(outdated);
    return Infraction.findOneAndDelete({ flag }, { new: false, lean: true }).exec();
  },
  /** Save an infraction*/
  save: function(data: Omit<Infraction, "timestamp">): Promise<Infraction> {
    if (data.message && typeof data.message !== "string") throw new TypeError(outdated);
    if (data.channel && typeof data.channel !== "string") throw new TypeError(outdated);
    if (data.flag && typeof data.flag !== "string") throw new TypeError(outdated);
    if (data.mod && typeof data.mod !== "string") throw new TypeError(outdated);
    if (data.handler && typeof data.handler !== "string") throw new TypeError(outdated);

    return new Infraction(data).save().then(i => i.toObject());
  },
  /** Update an infraction */
  update: function(infraction: Infraction): Promise<Infraction | null> {
    return Infraction.findOneAndUpdate({ flag: infraction.flag }, { handler: infraction.handler, value: infraction.value }, { new: true, lean: true }).exec();
  },
  /** Transfer an old account's infractions to their new account */
  transfer: function(oldUserId: string, newUserId: string) {
    return Infraction.bulkWrite([
      { updateMany: { filter: { discordId: oldUserId }, update: { $set: { discordId: newUserId } } } },
      { updateMany: { filter: { mod: oldUserId }, update: { $set: { mod: newUserId } } } },
      { updateMany: { filter: { handler: oldUserId }, update: { $set: { handler: newUserId } } } },
    ]);
  }
};