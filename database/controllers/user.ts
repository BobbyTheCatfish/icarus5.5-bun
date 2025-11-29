import { Collection, GuildMember } from "discord.js";
import moment from "moment-timezone";
import config from "../../config/config.json";
import User from "../models/User.model";
import ChannelXP from "../models/ChannelXP.model";
import { type ActiveUser } from "../../types/sharedModuleTypes";

export type UserRecord = {
  discordId: string
  roles: string[]
  badges: string[]
  posts: number
  voice: number
  trackXP: number
  currentXP: number
  totalXP: number
  priorTenure: number
  sendBdays: boolean
  watching: boolean
  twitchFollow: boolean
}

export type RankedUser = UserRecord & { rank: { season: number; lifetime: number} } 

export type leaderboardOptions = {
  memberIds: Collection<string, GuildMember> | string[]
  limit?: number
  member?: string
  season?: boolean
}

const outdated = "Expected a Discord ID but likely recieved an object instead. That's deprecated now!";

/**
 * @enum {number}
 */
export const TrackXPEnum = {
  OFF: 0,
  SILENT: 1,
  FULL: 2
};


const models = {
  TrackXPEnum,
  /** Add XP to a set of users */
  addXp: async function(activity: Collection<string, ActiveUser[]>): Promise<{ users: UserRecord[]; oldUsers: UserRecord[]; xp: number }> {
    const xpBase = Math.floor(Math.random() * 3) + config.xp.base;
    const included = await User.find({ discordId: { $in: [...activity.keys()] }, trackXP: { $ne: TrackXPEnum.OFF } }, undefined, { lean: true });
    const uniqueIncluded = new Set(included.map(u => u.discordId));
    await User.bulkWrite(
      activity.map((val, discordId) => {
        // add the multiple bonuses together
        const x = Math.ceil(xpBase * val.reduce((p, c) => c.multiplier + p, 0));
        const xp = uniqueIncluded.has(discordId) ? x : 0;
        if (!Number.isFinite(xp)) throw new Error(`${discordId} achieved INFINITE XP!`);
        if (xp > 500) throw new Error(`${discordId} was going to get ${xp} xp. That doesn't seem safe!\n${JSON.stringify(val)}`);
        const posts = val.filter(v => v.isMessage).length;
        const voice = val.filter(v => v.isVoice).length;
        return {
          updateOne: {
            filter: { discordId },
            update: { $inc: { currentXP: xp, totalXP: xp, posts, voice } },
            upsert: true,
            new: true
          }
        };
      })
    );
    const userDocs = await User.find(
      { discordId: { $in: [...activity.keys()] } }, null, { lean: true }
    ).exec();

    // update channel xp
    const uniqueChannels = new Collection<string, number[]>();
    const channels = activity.filter((_, id) => uniqueIncluded.has(id)).map(a => a).flat();
    for (const val of channels) {
      uniqueChannels.ensure(val.channelId, () => []).push(val.multiplier);
    }

    // no need to wait for it to finish before moving on
    ChannelXP.bulkWrite(
      uniqueChannels.map((v, channelId) => {
        const xp = Math.ceil(xpBase * v.reduce((p, c) => p + c, 0));
        return {
          updateOne: {
            filter: { channelId },
            update: { $inc: { xp } },
            upsert: true,
            new: true
          }
        };
      })
    );
    return { users: userDocs, oldUsers: included, xp: xpBase };
  },
  /** Fetch a user record from the database. */
  fetchUser: async function(discordId: string, createIfNotFound: boolean = true): Promise<UserRecord | null> {
    if (typeof discordId !== "string") throw new TypeError(outdated);
    return User.findOne({ discordId }, undefined, { lean: true, upsert: createIfNotFound }).exec();
  },
  /** DANGER!!! THIS RESETS ALL CURRENTXP TO 0 */
  resetSeason: async function() {
    await ChannelXP.deleteMany({}, { lean: true, new: true });
    return User.updateMany({ currentXP: { $gt: 0 } }, { currentXP: 0 }, { lean: true, new: true }).exec();
  },
  /** Get the top X of the leaderboard */
  getLeaderboard: async function(options: leaderboardOptions): Promise<(UserRecord & { rank: number })[]> {
    const members = (options.memberIds instanceof Collection ? Array.from(options.memberIds.keys()) : options.memberIds);
    const member = options.member;
    const season = options.season;
    const limit = options.limit ?? 10;

    // Get top X users first
    const query = User.find({ trackXP: { $ne: TrackXPEnum.OFF }, discordId: { $in: members } }, undefined, { lean: true });
    if (season) query.sort({ currentXP: "desc" });
    else query.sort({ totalXP: "desc" });

    const records = await query.limit(limit).exec();
    const ranked: (UserRecord & { rank: number })[] = records.map((r, i) => {
      return { ...r, rank: i + 1 };
    });

    // Get requested user
    const hasMember = ranked.some(r => r.discordId === member);
    if (member && !hasMember) {
      const record = await models.getRank(member, members);
      if (record) {
        ranked.push({ ...record, rank: season ? record.rank.season : record.rank.lifetime });
      }
    }

    return ranked;
  },

  /** Get the top X of both leaderboards */
  getBothLeaderboards: async function(options: Omit<leaderboardOptions, "season"> & { rank?: RankedUser | null }): Promise<{ season: (UserRecord & { rank: number })[]; life: (UserRecord & { rank: number })[] }> {
    const members = (options.memberIds instanceof Collection ? Array.from(options.memberIds.keys()) : options.memberIds);
    const member = options.member;
    const limit = options.limit ?? 10;

    const mapper = (users: UserRecord[]) => users.map((u, i) => ({ ...u, rank: i + 1 }));

    const query = () => User.find({ trackXP: { $ne: TrackXPEnum.OFF }, discordId: { $in: members } }, undefined, { lean: true }).limit(limit);
    const season = await query().sort({ currentXP: "desc" }).exec().then(mapper);
    const life = await query().sort({ totalXP: "desc" }).exec().then(mapper);

    // Get requested user
    const seasonHas = season.some(r => r.discordId === member);
    const lifeHas = life.some(r => r.discordId === member);
    if (member && (!seasonHas || !lifeHas)) {
      const record = options.rank ?? await models.getRank(member, members);
      if (record && record.trackXP !== TrackXPEnum.OFF) {
        if (!seasonHas) season.push({ ...record, rank: record.rank.season });
        if (!lifeHas) life.push({ ...record, rank: record.rank.lifetime });
      }
    }

    return { season, life };
  },
  /** Get a user's rank */
  getRank: async function(discordId: string, members: Collection<string, GuildMember> | string[], filterOptedOut = true): Promise<(UserRecord & { rank: { season: number; lifetime: number } }) | null> {
    members = (members instanceof Collection ? Array.from(members.keys()) : members);

    // Get requested user
    const record = await User.findOne({ discordId }, undefined, { lean: true }).exec();
    if (!record || (filterOptedOut && record.trackXP === TrackXPEnum.OFF)) return null;

    const seasonCount = await User.countDocuments({ trackXP: { $ne: TrackXPEnum.OFF }, currentXP: { $gt: record.currentXP }, discordId: { $in: members } });
    const lifeCount = await User.countDocuments({ trackXP: { $ne: TrackXPEnum.OFF }, totalXP: { $gt: record.totalXP }, discordId: { $in: members } });

    return { ...record, rank: { season: seasonCount + 1, lifetime: lifeCount + 1 } };
  },
  /**  Run a user database query */
  getUsers: function(query: object): Promise<UserRecord[]> {
    return User.find(query, undefined, { lean: true }).exec();
  },
  /** Create a new user record */
  newUser: async function(discordId: string): Promise<UserRecord | null> {
    if (typeof discordId !== "string") throw new TypeError(outdated);
    return User.findOne({ discordId }, undefined, { upsert: true, lean: true }).exec();
  },
  /** Update a member's roles in the database */
  updateRoles: function(member?: GuildMember, roles?: string[], backupId?: string): Promise<UserRecord | null> {
    if (member && !(member instanceof GuildMember)) throw new Error("Expected a GuildMember");
    if (backupId && typeof backupId !== 'string') throw new Error(outdated);
    return User.findOneAndUpdate(
      { discordId: backupId ?? member?.id },
      { $set: { roles: Array.from(roles ?? member?.roles.cache.keys() ?? []) } },
      { new: true, upsert: true, lean: true }
    ).exec();
  },
  /** Updates a guild member's tenure in the server database. */
  updateTenure: function(member: GuildMember): Promise<UserRecord | null> {
    if (!(member instanceof GuildMember)) throw new Error("Expected a GuildMember");
    return User.findOneAndUpdate(
      { discordId: member.id },
      { $inc: { priorTenure: (moment().diff(moment(member.joinedAt), "days") || 0) } },
      { new: true, upsert: true, lean: true }
    ).exec();
  },
  /** Gets all the channel xp info */
  getChannelXPs: function() {
    return ChannelXP.find({}, undefined, { lean: true }).exec();
  },
  /** Updates a property */
  update: function(discordId: string, update: Partial<UserRecord>): Promise<UserRecord | null> {
    if (typeof discordId !== "string") throw new Error(outdated);
    return User.findOneAndUpdate({ discordId }, update, { lean: true, new: true, upsert: true });
  }
};

export default models;
