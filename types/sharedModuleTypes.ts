import profanityMatcher from "profanity-matcher";
import SheetTypes from "./sheetTypes";
import { ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, Message, MessageReplyOptions } from "discord.js";

export type FilterShared = () => profanityMatcher

export type BankShared = {
    buyGame: (game: SheetTypes["AvailableGame"], user: GuildMember) => Promise<false | EmbedBuilder>,
    limit: { gb: number, ember: number },
    gb: string;
    ember: string;
}

export type CakeShared = {
    cakedays: (testDate?: Date, testJoinDate?: Date, testMember?: Collection<string, GuildMember>) => Promise<void>,
    birthdays: (testDate?: Date | string, testMember?: { discordId: string; ign: string | Date; }[]) => Promise<void>,
    celebrate: (test?: boolean) => void
}

type tag = import("../database/controllers/tag").tag;
export type TagsShared = {
    tags: Collection<string, tag>,
    encodeTag: (tag: tag, msg: Message | null, int?: ChatInputCommandInteraction) => string | Pick<MessageReplyOptions, "content" | "files" | "allowedMentions">
}

export interface ActiveUser {
  multiplier: number;
  channelId: string;
  discordId: string;
  isVoice: boolean;
  isMessage: boolean;
}