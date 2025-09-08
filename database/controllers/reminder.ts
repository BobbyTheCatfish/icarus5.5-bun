const { nanoid } = require("nanoid");
const { Moment } = require("moment-timezone");
const Reminder = require("../models/Reminder.model");

type Timer = {
  id: string;
  discordId: string;
  reminder: string;
  timestamp: number;
  started: number;
  isTimer: boolean;
}

module.exports = {
  fetchAll: (): Promise<Timer[]> => {
    return Reminder.find({}, undefined, { lean: true });
  },

  fetchUpcoming: (cutoffDate: Moment): Promise<Timer[]> => {
    return Reminder.find({ timestamp: { $lte: cutoffDate.valueOf() } }, undefined, { lean: true });
  },
  fetchUser: (discordId: string): Promise<Timer[]> => {
    return Reminder.find({ discordId }, undefined, { lean: true });
  },
  save: (reminder: Omit<Timer, "id">): Promise<Timer> => {
    return new Reminder({ ...reminder, id: nanoid(5).toUpperCase() }).save().then(r => r.toObject());
  },
  deleteById: (id: string, discordId: string): Promise<Timer | null> => {
    return Reminder.findOneAndDelete({ id: id.toUpperCase(), discordId }, { lean: true, new: false });
  },
  /** Transfer an old account's reminders to their new account  */
  transfer: function(oldUserId: string, newUserId: string) {
    return Reminder.updateMany({ discordId: oldUserId }, { discordId: newUserId }, { lean: true }).exec();
  }
};