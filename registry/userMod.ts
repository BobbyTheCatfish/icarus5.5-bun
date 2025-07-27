// @ts-check
import u from "./regUtils";

export default u.userContext()
  .setName("Moderation")
  .setContexts(u.contexts.Guild)
  .toJSON();
