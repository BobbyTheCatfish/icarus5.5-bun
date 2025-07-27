// @ts-check
import u from "./regUtils";

export default new u.cmd()
  .setName("applestoapples")
  .setContexts(u.contexts.Guild)
  .addStringOption(
    new u.string()
      .setName("name")
      .setDescription("The name of the card")
      .setMaxLength(21)
      .setRequired(true)
  )
  .addStringOption(
    new u.string()
      .setName("description")
      .setDescription("The flavor text for the card")
      .setMaxLength(100)
      .setRequired(true)
  )
  .setDescription("Make an apples to apples card!")
  .toJSON();
