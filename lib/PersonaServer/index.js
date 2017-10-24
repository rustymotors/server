const net = require("net");
const listener = require("../../src/nps_listeners.js");
const logger = require("../../src/logger.js");

function PersonaServer() {
  if (!(this instanceof PersonaServer)) {
    return new PersonaServer();
  }
}

/**
Need to open create listeners on the ports

When a connection opens, cass it to a session controller that will log the
connection and fork to a connection handlers
**/

PersonaServer.prototype.start = function start() {
  net
    .createServer(socket => {
      listener.personaListener(socket);
    })
    .listen("8228", "0.0.0.0", () => {
      logger.info(`Started Persona listener on TCP port: 8228`);
    });
};

module.exports = PersonaServer;
