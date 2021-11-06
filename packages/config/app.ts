import { createServer } from "net";
import P from "pino";
import { ConfigurationManager } from "./src/index";

const log = P().child({ service: "MCOServer:Patch" });
log.level = process.env.LOG_LEVEL || "info";

const config = ConfigurationManager.getInstance();

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
server.on("connection", (sock) => {
  sock.on("data", config.handleData);
});
const port = 4242;
log.debug(`Attempting to bind to port ${port}`);
server.listen(port);
