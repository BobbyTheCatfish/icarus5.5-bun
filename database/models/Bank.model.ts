import mongoose from "mongoose";
const Schema = mongoose.Schema;

const BankSchema = new Schema({
  discordId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "em"
  },
  otherUser: {
    type: String,
    required: true
  },
  hp: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Bank", BankSchema);
