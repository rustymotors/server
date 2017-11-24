// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const { loginDataHandler } = require("../lib/LoginServer/index.js");
const { personaDataHandler } = require("../lib/PersonaServer/index.js");
const { handler } = require("./TCPManager.js");

let connections = [];

class Connection {
  constructor(id, sock, mgr) {
    this.id = id;
    this.appID = 0;
    this.status = "INACTIVE";
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = 0;
    this.enc = {};
    this.encMCOTS = {};
    this.isSetupComplete = 0;
    this.mgr = mgr;
    this.inQueue = true;
  }
}

/**
 * Create new connection if when haven't seen this socket before, 
 * or update the socket on the connection object if we have.
 * @param {String} id 
 * @param {Socket} socket 
 */
function findOrNewConnection(remoteAddress, socket, mgr) {
  const con = findConnection(remoteAddress);
  if (con != null) {
    console.log(`I have seen connections from ${remoteAddress} before`);
    con.sock = socket;
    return con;
  } else {
    const newConnection = new Connection(remoteAddress, socket, mgr);
    console.log(
      `I have not seen connections from ${remoteAddress} before, adding it.`
    );
    connections.push(newConnection);
    return con;
  }
}

/**
 * Breaks a connection id into address and port
 * @param {String} id 
 * @returns {JSON}
 */
function parseConnectionId(id) {
  const parts = id.split("_");
  const address = parts[0];
  const port = parts[1];
  return { address, port };
}

/**
 * Check incoming data and route it to the correct handler based on port
 * @param {String} id 
 * @param {Buffer} data 
 */
function processData(port, remoteAddress, data) {
  console.log(`Got data from ${remoteAddress} on port ${port}`, data);
  const connectionHandlers = {
    "8226": function() {
      loginDataHandler(findConnection(remoteAddress).sock, data);
    },
    "8228": function() {
      personaDataHandler(findConnection(remoteAddress).sock, data);
    },
    "7003": function() {
      handler(findConnection(remoteAddress), data);
    },
    "43300": function() {
      handler(findConnection(remoteAddress), data);
    },
  };

  /**
   * TODO: Create a fallback handler
   */
  if (
    typeof connectionHandlers[port] != "function" ||
    connectionHandlers[port]()
  ) {
    console.error(
      `No known handler for port ${port}, unable to handle the request from ${remoteAddress} on port ${port}, aborting.`
    );
    console.log("Data was: ", data.toString("hex"));
    process.exit(1);
  }
}

/**
 * Dump all connections for debugging
 */
function dumpConnections() {
  return connections;
}

/**
 * Locate connection by id in the connections array
 * @param {String} connectionId 
 */
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

/**
 * Deletes the provided connection id from the connections array
 * FIXME: Doesn't actually seem to work
 * @param {String} connectionId 
 */
function deleteConnection(connectionId) {
  connections.filter(conn => {
    return conn.id != connectionId;
  });
}

module.exports = {
  findOrNewConnection,
  processData,
  dumpConnections,
  findConnection,
  deleteConnection,
};
