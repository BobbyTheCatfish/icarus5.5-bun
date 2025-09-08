const mongoose = require("mongoose");

const IgnSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true
  },
  system: {
    type: String,
    required: true
  },
  ign: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("Ign", IgnSchema);
