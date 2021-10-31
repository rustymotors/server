import { createServer } from "net";
import P from "pino";
import { RoutingServer } from "./src/index";

const router = RoutingServer.getInstance();

const log = P().child({ service: router.serviceName });

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
  sock.on("data", router.handleData);
});

server.listen(4242);
