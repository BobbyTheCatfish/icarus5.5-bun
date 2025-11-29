import profanityMatcher from "profanity-matcher";
import type { SheetTypes } from "./sheetTypes";
import { ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, Message, type MessageReplyOptions } from "discord.js";

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

type Tag = import("../database/controllers/tag").Tag;

export type TagsShared = {
    tags: Collection<string, Tag>,
    encodeTag: (tag: Tag, msg: Message | null, int?: ChatInputCommandInteraction) => string | Pick<MessageReplyOptions, "content" | "files" | "allowedMentions">
}

export interface ActiveUser {
  multiplier: number;
  channelId: string;
  discordId: string;
  isVoice: boolean;
  isMessage: boolean;
}