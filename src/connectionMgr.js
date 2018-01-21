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

const { loginDataHandler } = require('../lib/LoginServer/index.js');
const { personaDataHandler } = require('../lib/PersonaServer/index.js');
const { handler } = require('./TCPManager.js');
const logger = require('./logger.js');

const connections = [];

class Connection {
  constructor(id, sock, mgr) {
    this.id = id;
    this.appID = 0;
    this.status = 'INACTIVE';
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = 0;
    this.enc = {};
    this.enc2 = {};
    this.isSetupComplete = 0;
    this.mgr = mgr;
    this.inQueue = true;
  }
}

/**
 * Locate connection by id in the connections array
 * @param {String} connectionId
 */
function findConnection(connectionId) {
  const results = connections.find((connection) => {
    const match = connectionId.toString() === connection.id.toString();
    return match;
  });
  return results;
}

function updateConnectionById(connectionId, newConnection) {
  if (newConnection === undefined) {
    throw new Error('Undefined connection');
  }
  const index = connections.findIndex(connection => connection.id === connectionId);
  connections.splice(index, 1);
  connections.push(newConnection);
}

/**
 * Create new connection if when haven't seen this socket before,
 * or update the socket on the connection object if we have.
 * @param {String} id
 * @param {Socket} socket
 */
function findOrNewConnection(socket) {
  const { remoteAddress } = socket;
  const con = findConnection(remoteAddress);
  if (con !== undefined) {
    // logger.info(`I have seen connections from ${remoteAddress} before`);
    con.sock = socket;
    return con;
  }
  const connectionManager = this;
  const newConnection = new Connection(remoteAddress, socket, connectionManager);
  // logger.info(`I have not seen connections from ${remoteAddress} before, adding it.`);
  connections.push(newConnection);
  return newConnection;
}

/**
 * Check incoming data and route it to the correct handler based on port
 * @param {String} id
 * @param {Buffer} data
 */
async function processData(rawPacket) {
  const {
    connection, remoteAddress, listenerPort, data,
  } = rawPacket;
  logger.info(`Connection Manager: Got data from ${remoteAddress} on port ${listenerPort}`, data);
  const handlePacketByPort = {
    8226: loginDataHandler,
    8228: personaDataHandler,
    7003: handler,
    43300: handler,
  };

  if (handlePacketByPort[listenerPort]) {
    // Process the packet if a handler exists
    return handlePacketByPort[listenerPort](connection, data);
  }

  /**
   * TODO: Create a fallback handler
   */
  logger.error(`No known handler for port ${listenerPort}, unable to handle the request from ${remoteAddress} on port ${listenerPort}, aborting.`);
  logger.info('Data was: ', data.toString('hex'));
  process.exit(1);
  return null;
}

/**
 * Dump all connections for debugging
 */
function dumpConnections() {
  return connections;
}

/**
 * Deletes the provided connection id from the connections array
 * FIXME: Doesn't actually seem to work
 * @param {String} connectionId
 */
function deleteConnection(connection) {
  connections.filter(conn => conn.id !== connection.id);
}

module.exports = {
  findOrNewConnection,
  processData,
  dumpConnections,
  findConnection,
  deleteConnection,
  updateConnectionById,
};
