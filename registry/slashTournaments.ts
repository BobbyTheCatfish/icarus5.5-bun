// @ts-check
import u from "./regUtils";

export default new u.cmd()
  .setName("tournaments")
  .setDescription("Get a list of tournaments in the server.")
  .setContexts(u.contexts.Guild)
  .toJSON();