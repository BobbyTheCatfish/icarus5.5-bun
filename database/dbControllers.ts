// @ts-check
const config = require("../config/config.json"),
  mongoose = require("mongoose");

const bank = require("./controllers/bank");
const ign = require("./controllers/ign");
const infraction = require("./controllers/infraction");
const tags = require("./controllers/tag");
const user = require("./controllers/user");
const reminder = require("./controllers/reminder");
const starboard = require("./controllers/starboard");
const tournament = require("./controllers/tournament");

const { data, loadData, functionSchemas: schemas } = require("./sheets");

mongoose.connect(config.db.db, config.db.settings);

module.exports = {
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