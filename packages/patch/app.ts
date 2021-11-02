import { EServerConnectionName, RoutingMesh } from "mcos-router";
import { createServer } from "http";
import P from "pino";
import { PatchServer } from "./src/index";

const patch = PatchServer.getInstance();

const log = P().child({ service: "MCOServer:Patch" });
log.level = process.env.LOG_LEVEL || "info";

const host = "localhost";
let port = 81;

if (process.env.LISTEN_PORT !== undefined) {
  port = Number.parseInt(process.env.LISTEN_PORT);
}

const server = createServer();
server.on("listening", () => {
  const listeningAddress = server.address();
  if (
    typeof listeningAddress !== "string" &&
    listeningAddress !== null &&
    listeningAddress.port !== undefined
  )
    log.info(`Server is listening on port ${listeningAddress.port}`);
});
server.on("request", patch.handleRequest);

server.listen(host, port);

// Register service with router
RoutingMesh.getInstance().registerServiceWithRouter(
  EServerConnectionName.PATCH,
  host,
  port
);
