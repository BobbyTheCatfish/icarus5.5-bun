import { Client } from "discord.js";

declare module "augurbot-ts" {
    class AugurClient extends Client<boolean> {}
}