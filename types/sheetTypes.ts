import * as Discord from "discord.js";


type AvailableGame = {
    title: string;
    system: string;
    rating: string;
    cost: number;
    code: string;
    key: string;
    steamId: string;
}

type BoughtGame = AvailableGame & {
    recipient: string | null;
    date: Date | null;
}

type IGN = {
    name: string;
    system: string;
    category: string;
    aliases: string[];
    link: string | null;
}

type OptRole = {
    name: string;
    role: Discord.Role;
    badge: string | null;
    badgeLore: string | null;
}

type Role = {
    type: "Equip" | "Comment" | "Team Assign" | "Rank" | "Year";
    base: Discord.Role;
    color: Discord.Role | null;
    parents: string[];
    level: string | null;
    badge: string | null;
    badgeLore: string | null;
}

type ColorRole = Omit<Role, "color"> & { color: Discord.Role; };
type LevelStrRole = Omit<Role, "level"> & { level: string; };
type LevelNumRole = Omit<Role, "level"> & { level: number; };

type FullRole = Omit<Role, "level" | "color"> & { level: string; color: Discord.Role; };

type Sponsor = {
    userId: string;
    channel: Discord.TextChannel | null;
    emojiId: string | null;
    enabled: boolean;
    archiveAt: Date | null;
}

type Starboard = {
    channel: Discord.GuildTextBasedChannel;
    priorityChannels: Set<string>;
    priorityEmoji: Set<string>;
    threshold: number;
    approval: boolean;
}

type TourneyChampion = {
    tourneyName: string;
    userId: string;
    takeAt: Date | null;
    key: string;
}

type ChannelXPSetting = {
    channelId: string;
    emoji: Set<string>;
    posts: number;
    preferMedia: boolean;
}

type PlayingDefault = {
    channelId: string;
    name: string;
}

export default interface SheetTypes {
    AvailableGame: AvailableGame;
    BoughtGame: BoughtGame;
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
