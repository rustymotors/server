const { createServer } = require("net");
const { pino: P } = require("pino");
const { ConfigurationManager } = require("./src/index.js");

const log = P().child({ service: "mcos:Patch" });
log.level = process.env["LOG_LEVEL"] || "info";

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
