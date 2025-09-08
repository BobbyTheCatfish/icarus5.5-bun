const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
  response: { type: String, default: null },
  attachment: { type: String, default: null },
  attachmentMime: { type: String, default: null }
});

module.exports = mongoose.model("Tag", TagSchema);