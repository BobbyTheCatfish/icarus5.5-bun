import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
  },
  reminder: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  started: {
    type: Number,
    required: true
  },
  isTimer: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  }
});

export default mongoose.model("Remind", ReminderSchema);