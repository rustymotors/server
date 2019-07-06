import * as PatchAndShardServer from "./patchServer";

import { Logger } from "../shared/logger";

const logger = new Logger().getLogger();

// Start the mock patch server and shardlist sserver
const patchAndShard = PatchAndShardServer.start();
logger.debug("[patchServer] Patch Server started");
