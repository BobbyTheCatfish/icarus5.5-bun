import Tag from "../models/Tag.model";
import { Types as MongoTypes } from "mongoose";

export type Tag = {
  tag: string;
  response?: string | null;
  attachment?: string | null;
  attachmentMime?: string | null;
  _id: MongoTypes.ObjectId;
}

export default {
  /** Fetch all tags */
  fetchAllTags: function(): Promise<Tag[]> {
    return Tag.find({}, undefined, { lean: true }).exec();
  },
  /** Create or modify a tag */
  manageTag: function(data: Omit<Tag, "_id">): Promise<Tag | null> {
    return Tag.findOneAndUpdate({ tag: data.tag }, data, { upsert: true, lean: true, new: true });
  },
  /** Delete a tag */
  deleteTag: function(tag: string): Promise<Tag | null> {
    return Tag.findOneAndDelete({ tag }, { new: false, lean: true }).exec();
  }
};