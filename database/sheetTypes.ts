import Discord from "discord.js";

export type Game = {
    title: string;
    system: string;
    rating: string;
    cost: number;
    recipient: string | null;
    code: string;
    key: string;
    steamId: string;
    date: Date | null;
}

export type IGN = {
    name: string;
    system: string;
    category: string;
    aliases: string[];
    link: string | null;
}

export type OptRole = {
    name: string;
    role: Discord.Role;
    badge: string | null;
    badgeLore: string | null;
}

export type Role = {
    type: "Equip" | "Comment" | "Team Assign" | "Rank" | "Year";
    base: Discord.Role;
    color: Discord.Role | null;
    parents: string[];
    level: string | null;
    badge: string | null;
    badgeLore: string | null;
}

export type ColorRole = Omit<Role, "color"> & { color: Discord.Role; };
export type LevelStrRole = Omit<Role, "level"> & { level: string; };
export type LevelNumRole = Omit<Role, "level"> & { level: number; };

export type FullRole = Omit<Role, "level" | "color"> & { level: string; color: Discord.Role; };

export type Sponsor = {
    userId: string;
    channel: Discord.TextChannel | null;
    emojiId: string | null;
    enabled: boolean;
    archiveAt: Date | null;
}

export type Starboard = {
    channel: Discord.GuildTextBasedChannel;
    priorityChannels: Set<string>;
    priorityEmoji: Set<string>;
    threshold: number;
    approval: boolean;
}

export type TourneyChampion = {
    tourneyName: string;
    userId: string;
    takeAt: Date | null;
    key: string;
}

export type ChannelXPSetting = {
    channelId: string;
    emoji: Set<string>;
    posts: number;
    preferMedia: boolean;
}

export type PlayingDefault = {
    channelId: string;
    name: string;
}

export default interface SheetTypes {
    Game: Game;
    IGN: IGN;
    OptRole: OptRole;
    Role: Role;
    ColorRole: ColorRole;
    LevelStrRole: LevelStrRole;
    LevelNumRole: LevelNumRole;
    FullRole: FullRole;
    Sponsor: Sponsor;
    Starboard: Starboard;
    TourneyChampion: TourneyChampion;
    ChannelXPSetting: ChannelXPSetting;
    PlayingDefault: PlayingDefault;
}
