const series = require("async/series");
const fs = require("fs");
const net = require("net");

const NodeRSA = require("node-rsa");
const rc4 = require("arc4");
const listener = require("./nps_listeners.js");
const logger = require("./logger.js");

const configurationFile = require("../config.json");

function initCrypto() {
  const config = configurationFile.serverConfig;
  try {
    fs.statSync(config.privateKeyFilename);
  } catch (e) {
    logger.error(`Error loading private key: ${e}`);
    process.exit(1);
  }
  // privateKey = new NodeRSA(fs.readFileSync(config.privateKeyFilename))
  return new NodeRSA(fs.readFileSync(config.privateKeyFilename));
}

function npsCheckToken() {
  // data[17] = plate name
  return null;
}

function initNPSCrypto() {
  return rc4("arc4", "secret_key");
}

function start(cbStart) {
  /* Initialize the crypto */
  let privateKey = null;
  try {
    privateKey = initCrypto();
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  // Start the servers
  const session = {
    privateKey,
    enc: initNPSCrypto(),
  };

  const config = configurationFile.serverConfig;

  series(
    {
      serverLogin: callback => {
        const server = net.createServer(socket => {
          session.loginSocket = socket;
          listener.loginListener(session);
        });
        server.listen(config.serverLogin.port, "0.0.0.0", () => {
          logger.info(
            `${config.serverLogin.name} Server listening on TCP port: ${config
              .serverLogin.port}`
          );
          callback(null, server);
        });
      },
      serverPersona: callback => {
        const server = net.createServer(socket => {
          session.personaSocket = socket;
          listener.personaListener(session);
        });
        server.listen(config.serverPersona.port, "0.0.0.0", () => {
          logger.info(
            `${config.serverPersona.name} Server listening on TCP port: ${config
              .serverPersona.port}`
          );
          callback(null, server);
        });
      },
      serverLobby: callback => {
        const server = net.createServer(socket => {
          session.lobbySocket = socket;
          listener.lobbyListener(session);
        });
        server.listen(config.serverLobby.port, "0.0.0.0", () => {
          logger.info(
            `${config.serverLobby.name} Server listening on TCP port: ${config
              .serverLobby.port}`
          );
          callback(null, server);
        });
      },
      serverDatabase: callback => {
        const server = net.createServer(socket => {
          session.databaseSocket = socket;
          listener.databaseListener(session);
        });
        server.listen(config.serverDatabase.port, "0.0.0.0", () => {
          logger.info(
            `${config.serverDatabase
              .name} Server listening on TCP port: ${config.serverDatabase
              .port}`
          );
          callback(null, server);
        });
      },
    },
    err => {
      if (err) {
        throw err;
      }
      // Not currently using this

      cbStart(null);
    }
  );
}

module.exports = {
  start,
  npsCheckToken,
  initCrypto,
};
