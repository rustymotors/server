import * as WebServer from "./WebServer";
import { ILoggers } from "../../services/shared/logger";

export function start(loggers: ILoggers) {
  // Start the AuthLogin server
  const webServer = WebServer.start();
  loggers.both.debug("[webServer] Web Server started");
}
