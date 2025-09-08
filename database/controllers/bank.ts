const moment = require("moment-timezone");
const Bank = require("../models/Bank.model");

type CurrencyRecord = {
  discordId: string;
  timestamp: Date;
  description: string;
  value: number;
  currency: string;
  otherUser: string;
  hp: boolean;
}

const outdated = "Expected a Discord ID but likely recieved an object instead. That's deprecated now!";

module.exports = {
  /** Get all user records */
  getAll: async function(discordId: string): Promise<CurrencyRecord[]> {
    if (typeof discordId !== "string") throw new TypeError(outdated);
    return Bank.find({ discordId }, undefined, { lean: true }).exec();
  },
  getReport: async function(discordIds: string[], startDate: moment.Moment): Promise<CurrencyRecord[]> {
    if (!startDate) {
      const seasonStart = moment.tz("America/Denver").startOf("month").hour(19);
      const monthsAgo = seasonStart.month() % 4;
      seasonStart.subtract(monthsAgo, "months");
      startDate ??= seasonStart;
    }

    return Bank.find({
      discordId: { $in: discordIds },
      currency: "em",
      hp: true,
      timestamp: { $gte: startDate.toDate() }
    }, undefined, { lean: true }).exec();
  },
  /** Gets a user's current balance for a given currency. */
  getBalance: async function(discordId: string): Promise<{ discordId: string; gb: number; em: number; }> {
    if (typeof discordId !== "string") throw new TypeError(outdated);
    const record = await Bank.aggregate([
      { $match: { discordId } },
      { $group: {
        _id: null,
        em: { $sum: { $cond: { if: { $eq: ["$currency", "em"] }, then: "$value", else: 0 } } },
        gb: { $sum: { $cond: { if: { $eq: ["$currency", "gb"] }, then: "$value", else: 0 } } }
      } }
    ]).exec();
    return { discordId, gb: record[0]?.gb ?? 0, em: record[0]?.em ?? 0 };
  },
  /** Adds currency to a user's account. */
  addCurrency: function(data: Omit<CurrencyRecord, "timestamp">): Promise<CurrencyRecord> {
    if (typeof data.discordId !== 'string') throw new TypeError(outdated);
    return new Bank(data).save();
  },
  /** Adds many currency records */
  addManyTransactions: function(data: CurrencyRecord[]): Promise<CurrencyRecord[]> {
    return Bank.insertMany(data.map(d => new Bank(d)), { lean: true });
  },
  /** Transfer an old account's transactions to their new account */
  transfer: function(oldUserId: string, newUserId: string) {
    return Bank.bulkWrite([
      { updateMany: { filter: { discordId: oldUserId }, update: { $set: { discordId: newUserId } } } },
      { updateMany: { filter: { otherUser: oldUserId }, update: { $set: { otherUser: newUserId } } } },
    ]);
  }
};
