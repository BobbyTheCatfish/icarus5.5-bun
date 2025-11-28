// @ts-check
import config from "../config/config.json";
import mongoose from "mongoose";

import bank from "./controllers/bank";
import ign from "./controllers/ign";
import infraction from "./controllers/infraction";
import tags from "./controllers/tag";
import user from "./controllers/user";
import reminder from "./controllers/reminder";
import starboard from "./controllers/starboard";
import tournament from "./controllers/tournament";

import { data, loadData, functionSchemas as schemas } from "./sheets";

mongoose.connect(config.db.db, config.db.settings);

export default {
  bank,
  ign,
  infraction,
  tags,
  user,
  reminder,
  starboard,
  tournament,
  sheets: { ...data, loadData, schemas }
};