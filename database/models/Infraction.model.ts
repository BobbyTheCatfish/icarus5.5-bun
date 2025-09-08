const mongoose = require("mongoose");

const InfractionSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  flag: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  value: {
    type: Number,
    default: 0,
    required: true
  },
  mod: {
    type: String,
    required: true
  },
  handler: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model("Infraction", InfractionSchema);
