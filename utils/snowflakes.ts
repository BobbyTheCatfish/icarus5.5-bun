const realSF = require("../config/snowflakes.json");
const testSF = require("../config/snowflakes-testing.json");
const commandSF = require("../config/snowflakes-commands.json");
const config = require("../config/config.json");


module.exports = { ...(config.devMode ? testSF : realSF ), ...commandSF }
