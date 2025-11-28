import Starboard from "../models/Starboard.model";

interface StarboardPost {
  messageId: string;
  postedAt: number;
}

export default {
  getMessage: (messageId: string): Promise<StarboardPost | null> => {
    return Starboard.findOne({ messageId }, { lean: true }).exec();
  },
  saveMessage: (messageId: string, postedAt: number): Promise<StarboardPost> => {
    return new Starboard({ messageId, postedAt }).save().then(d => d.toObject());
  },
  cleanup: () => {
    return Starboard.deleteMany({ postedAt: { $lt: Date.now() - 8 * 24 * 60 * 60_000 } }, { lean: true, new: false }).exec();
  }
};