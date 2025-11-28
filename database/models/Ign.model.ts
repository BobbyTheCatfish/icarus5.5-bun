import mongoose from "mongoose";

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

export default mongoose.model("Ign", IgnSchema);
