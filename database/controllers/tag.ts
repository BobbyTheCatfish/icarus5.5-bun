// @ts-check
import Tag from "../models/Tag.model";
import { Types as MongoTypes } from "mongoose";

type tag = {
  tag: string;
  response?: string | null;
  attachment?: string | null;
  attachmentMime?: string | null;
  _id: MongoTypes.ObjectId;
}

export default {
  /** Fetch all tags */
  fetchAllTags: function(): Promise<tag[]> {
    return Tag.find({}, undefined, { lean: true }).exec();
  },
  /** Create or modify a tag */
  manageTag: function(data: Omit<tag, "_id">): Promise<tag | null> {
    return Tag.findOneAndUpdate({ tag: data.tag }, data, { upsert: true, lean: true, new: true });
  },
  /** Delete a tag */
  deleteTag: function(tag: string): Promise<tag | null> {
    return Tag.findOneAndDelete({ tag }, { new: false, lean: true }).exec();
  }
};