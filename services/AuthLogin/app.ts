import * as WebServer from "./WebServer";

import { Logger } from "../shared/logger";

const logger = new Logger().getLogger();

// Start the AuthLogin server
const webServer = WebServer.start();
logger.debug("[webServer] Web Server started");
