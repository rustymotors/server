import P from "pino";
import { APP_CONFIG } from "mcos-shared/config";

const logger = P({
  level: APP_CONFIG.MCOS.SETTINGS.LOG_LEVEL || "info",
  name: "mcos",
});

export { logger };
