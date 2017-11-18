const net = require("net");

function startTCPListener(listenerPort, connectionMgr, callback) {
  let remoteAddress;
  let id;

  const server = net.createServer(c => {
    // 'connection' listener
    remoteAddress = c.remoteAddress;
    id = `${remoteAddress}_${listenerPort}`;
    console.log(`Client ${remoteAddress} connected to port ${listenerPort}`);
    connectionMgr.findOrNewConnection(id, c);
    c.on("end", () => {
      connectionMgr.deleteConnection(id);
      console.log(
        `Client ${remoteAddress} disconnected from port ${listenerPort}`
      );
    });
    c.on("data", data => {
      connectionMgr.processData(id, data);
    });
    c.on("error", err => {
      if (err.code !== "ECONNRESET") {
        console.error(err.message);
        console.error(err.stack);
        process.exit(1);
      }
    });
  });
  server.listen(listenerPort, "0.0.0.0", () => {
    console.log(`Listener started on port ${listenerPort}`);
  });
}

module.exports = { startTCPListener };
