import P from "pino";
import config from "../config/appconfig";

const logger = P({
  level: config.MCOS.SETTINGS.LOG_LEVEL || "info",
  name: "mcos",
});

export { logger };
