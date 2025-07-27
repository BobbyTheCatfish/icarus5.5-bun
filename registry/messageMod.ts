// @ts-check
import u from "./regUtils";

export default u.msgContext()
  .setName("Moderation")
  .setContexts(u.contexts.Guild)
  .toJSON();
