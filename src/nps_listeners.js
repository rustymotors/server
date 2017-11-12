const handler = require("./nps_handlers.js");
const logger = require("./logger.js");
const TCPManager = require("./TCPManager.js");

tcpMander = new TCPManager.TCPManager();

function listener(socket) {
  // Is this a login connection?
  if (socket.localPort == 8226) {
    logger.debug("New Login Connection...");

    // Add a 'data' event handler to this instance of socket
    socket.on("data", data => {
      handler.loginDataHandler(socket, data);
    });
    socket.on("error", err => {
      if (err.code !== "ECONNRESET") {
        throw err;
      }
    });
    socket.on("close", () => {
      logger.info("Closing Login socket");
    });
  } else {
    const con = tcpManager.getFreeConnection();

    con.sock = socket;

    logger.debug("New Connection...");
    logger.debug("ConnectionID: ", con.id);

    // Add a 'data' event handler to this instance of socket
    socket.on("data", data => {
      handler.handler(con, data);
    });
    socket.on("error", err => {
      if (err.code !== "ECONNRESET") {
        throw err;
      }
    });
    socket.on("close", () => {
      logger.info(
        `Closing socket id ${con.id} for port ${con.sock.localPort} from ${con
          .sock.remoteAddress}`
      );
    });
  }
}

module.exports = {
  listener,
};
