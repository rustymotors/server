import { Logger } from "./services/shared/logger";

// get instance of loggers
const loggers = new Logger().getLoggers();

// MCOS Monolith
import { Server } from "./server";
const server = new Server(loggers);
// MCOS AuthLogin and Shard
import * as AuthLogin from "./services/AuthLogin/app";
AuthLogin.start(loggers);
// MCOS PatchAndShard
import * as PatchAndShard from "./services/PatchAndShard/app";
PatchAndShard.start(loggers);
