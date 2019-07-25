import * as net from "net";
import * as repl from "repl";
import { PatchServer } from "./services/PatchAndShard/patchServer";
import { WebServer } from "./services/AuthLogin/WebServer";
import { Server } from "./server";
import { ConfigManager } from "./services/shared/configManager";

// get instance of config
const config = new ConfigManager().getConfig();

// MCOS Monolith
const server = new Server();
server.start();
// MCOS AuthLogin and Shard
const AuthLogin = new WebServer();
AuthLogin.start();
// MCOS PatchAndShard
const patchAndShardServer = new PatchServer();
patchAndShardServer.start();

net
  .createServer(function(socket) {
    const local = repl.start({
      prompt: "node via TCP socket> ",
      input: socket,
      output: socket,
    });
    local.context.server = server;
  })
  .listen(5001, "0.0.0.0");
