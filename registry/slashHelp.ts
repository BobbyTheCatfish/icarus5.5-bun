// @ts-check
import u from "./regUtils";

export default new u.cmd()
  .setName("help")
  .setDescription("Get a list of commands and custom tags in the server.")
  .toJSON();