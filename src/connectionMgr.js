const { loginDataHandler } = require("../lib/LoginServer/index.js");
const { personaDataHandler } = require("../lib/PersonaServer/index.js");
const { handler } = require("./TCPManager.js");

let connections = [];

class Connection {
  constructor(id, sock) {
    this.id = id;
    this.appID = 0;
    this.status = "INACTIVE";
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = 0;
    this.enc = null;
    this.isSetupComplete = 0;
  }
}

function findOrNewConnection(id, socket) {
  const con = findConnection(id);
  if (con != null) {
    console.log(`I have seen connection id ${id} before`);
    con.sock = socket;
  } else {
    connections.push(new Connection(id, socket));
    console.log(`I have not seen connection id ${id} before, adding it.`);
  }
}

function processData(id, data) {
  console.log(`Got data from ${id}`, data);
  if (id.indexOf("_8226") > 0) {
    /**
       * Login port connection
       */
    loginDataHandler(findConnection(id).sock, data);
  } else if (id.indexOf("_8228") > 0) {
    /**
       * Persona port connection
       */
    personaDataHandler(findConnection(id).sock, data);
  } else if (id.indexOf("_7003") > 0) {
    /**
       * Lobby port connection
       */
    handler(findConnection(id), data);
  } else if (id.indexOf("_43300") > 0) {
    /**
       * MCOTS port connection
       */
    handler(findConnection(id), data);
  }
}

function dumpConnections() {
  return connections;
}

function findConnection(connectionId) {
  results = connections.find(function(connection) {
    return connection.id.toString() == connectionId.toString();
  });
  if (results == undefined) {
    return null;
  } else {
    return results;
  }
}

module.exports = {
  findOrNewConnection,
  processData,
  dumpConnections,
  findConnection,
};
