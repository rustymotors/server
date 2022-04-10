import P from "pino";
import { APP_CONFIG } from "../config/appconfig.js";

const logger = P({
  level: APP_CONFIG.MCOS.SETTINGS.LOG_LEVEL || "info",
  name: "mcos",
});

export { logger };
