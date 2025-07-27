import u from "./regUtils";

export default u.msgContext()
  .setName("Edit Message")
  .setContexts(u.contexts.Guild)
  .setDefaultMemberPermissions(u.privateCommand)
  .toJSON();