import * as PatchAndShardServer from "./patchServer";

import { ILoggers } from "../../services/shared/logger";

export function start(loggers: ILoggers) {
  // Start the AuthLogin server
  const webServer = PatchAndShardServer.start();
  loggers.both.debug("[patchServer] Patch Server started");
}
