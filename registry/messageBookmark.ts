
import u from "./regUtils";

export default u.msgContext()
  .setName("Bookmark")
  .setContexts(u.contexts.Guild, u.contexts.PrivateChannel, u.contexts.BotDM)
  .toJSON();
