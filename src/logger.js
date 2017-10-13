const logger = require("winston");
const config = require("../config.json");

logger.cli();
// logger.add(logger.transports.File, { filename: 'logs/mco_server.log' })
logger.add(require("winston-daily-rotate-file"), {
  filename: "logs/mco-server_log.json",
  json: true,
  prepend: true,
  datePattern: "yyyy-MM-dd_"
});
logger.level = config.loggerLevel;

module.exports = logger;
