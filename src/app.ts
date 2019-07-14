import { Logger } from "./services/shared/logger";
import * as fs from "fs";
import * as yaml from "js-yaml";

// get instance of loggers
const loggers = new Logger().getLoggers();

// get instance of config
const config = yaml.safeLoad(
  fs.readFileSync("./src/services/shared/config.yml", "utf8")
);

// MCOS Monolith
import { Server } from "./server";
const server = new Server(config, loggers);
// MCOS AuthLogin and Shard
import { WebServer } from "./services/AuthLogin/WebServer";
const AuthLogin = new WebServer(config, loggers);
AuthLogin.start();
// MCOS PatchAndShard
import { PatchServer } from "./services/PatchAndShard/patchServer";
const patchAndShardServer = new PatchServer(config, loggers);
patchAndShardServer.start();
