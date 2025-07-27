import mongoose from "mongoose";

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

export default mongoose.model("Starboard", StarboardSchema);
