import { ConfigManager } from "./configManager";

// get instance of config
const config = new ConfigManager().getConfig();

// MCOS Monolith
import { Server } from "./server";
const server = new Server(config);
// MCOS AuthLogin and Shard
import { WebServer } from "./services/AuthLogin/WebServer";
const AuthLogin = new WebServer(config);
AuthLogin.start();
// MCOS PatchAndShard
import { PatchServer } from "./services/PatchAndShard/patchServer";
const patchAndShardServer = new PatchServer(config);
patchAndShardServer.start();
