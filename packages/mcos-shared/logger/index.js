import { APP_CONFIG } from "mcos-shared/config";
import P from "pino";

const logger = P({
  level: APP_CONFIG.MCOS.SETTINGS.LOG_LEVEL || "info",
  name: "mcos",
});

export { logger };
