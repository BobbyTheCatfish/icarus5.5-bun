import realSF from "../config/snowflakes.json"
import testSF from "../config/snowflakes-testing.json"
import commandSF from "../config/snowflakes-commands.json"
import config from "../config/config.json"


export default { ...(config.devMode ? testSF : realSF ), ...commandSF }
