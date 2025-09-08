const mongoose = require("mongoose");

const StarboardSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true
  },
  postedAt: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Starboard", StarboardSchema);
