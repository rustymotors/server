import { createServer } from "net";
import { pino } from "pino";
import { ConfigurationManager } from "./src/index";

const config = ConfigurationManager.getInstance();

const log = pino().child({ service: config.serviceName });

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

server.listen(4242);
