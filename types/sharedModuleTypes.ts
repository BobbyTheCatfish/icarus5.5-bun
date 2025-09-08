const profanityMatcher = require("profanity-matcher");
const SheetTypes = require("./sheetTypes");
const { ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, Message, MessageReplyOptions } = require("discord.js");

type FilterShared = () => profanityMatcher

type BankShared = {
    buyGame: (game: SheetTypes["AvailableGame"], user: GuildMember) => Promise<false | EmbedBuilder>,
    limit: { gb: number, ember: number },
    gb: string;
    ember: string;
}

type CakeShared = {
    cakedays: (testDate?: Date, testJoinDate?: Date, testMember?: Collection<string, GuildMember>) => Promise<void>,
    birthdays: (testDate?: Date | string, testMember?: { discordId: string; ign: string | Date; }[]) => Promise<void>,
    celebrate: (test?: boolean) => void
}

type tag = import("../database/controllers/tag").tag;
type TagsShared = {
    tags: Collection<string, tag>,
    encodeTag: (tag: tag, msg: Message | null, int?: ChatInputCommandInteraction) => string | Pick<MessageReplyOptions, "content" | "files" | "allowedMentions">
}

interface ActiveUser {
  multiplier: number;
  channelId: string;
  discordId: string;
  isVoice: boolean;
  isMessage: boolean;
}