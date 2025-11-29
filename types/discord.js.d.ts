import type { AugurOptions, BotConfig, CommandExecution, InteractionExecution } from "augurbot-ts/dist/types/ClientTypes";
import type { ErrorHandler, ParseFunction } from "augurbot-ts/dist/types/UtilTypes";
import * as Discord from "discord.js"
import type ModuleManager from "augurbot-ts/dist/managers/Modules";

declare module 'discord.js' {
    interface Client {
        config: BotConfig
        augurOptions: AugurOptions
        moduleManager: ModuleManager
        errorHandler: ErrorHandler
        parse: ParseFunction
        commandExecution: CommandExecution
        interactionExecution: InteractionExecution
        applicationId: string
        delayStart: () => Promise<any>;
        getTextChannel(id: string): Discord.TextChannel | null;
        getDmChannel(id: string): Discord.DMChannel | null;
        getGroupDmChannel(id: string): Discord.PartialGroupDMChannel | null;
        getVoiceChannel(id: string): Discord.VoiceChannel | null;
        getCategoryChannel(id: string): Discord.CategoryChannel | null;
        getNewsChannel(id: string): Discord.NewsChannel | null;
        getAnnouncementsThread(id: string): Discord.PublicThreadChannel | null;
        getPublicThread(id: string): Discord.PublicThreadChannel | null;
        getPrivateThread(id: string): Discord.PrivateThreadChannel | null;
        getStage(id: string): Discord.StageChannel | null;
        getDirectory(id: string): Discord.DirectoryChannel | null;
        getForumChannel(id: string): Discord.ForumChannel | null;
    } 
}