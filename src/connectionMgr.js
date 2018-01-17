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
    const id = connectionId.toString();
    return id === connection.id.toString();
  });
  return results;
}

function updateConnectionByAddress(connectionId, newConnection) {
  
}

/**
 * Create new connection if when haven't seen this socket before,
 * or update the socket on the connection object if we have.
 * @param {String} id
 * @param {Socket} socket
 */
function findOrNewConnection(remoteAddress, socket, mgr) {
  const con = findConnection(remoteAddress);
  if (con !== undefined) {
    logger.info(`I have seen connections from ${remoteAddress} before`);
    con.sock = socket;
    return con;
  }
  const newConnection = new Connection(remoteAddress, socket, mgr);
  logger.info(`I have not seen connections from ${remoteAddress} before, adding it.`);
  connections.push(newConnection);
  return newConnection;
}

/**
 * Check incoming data and route it to the correct handler based on port
 * @param {String} id
 * @param {Buffer} data
 */
function processData(port, remoteAddress, data) {
  logger.info(`Got data from ${remoteAddress} on port ${port}`, data);

  if (port === 8226) {
    return loginDataHandler(findConnection(remoteAddress).sock, data);
  }

  if (port === 8228) {
    return personaDataHandler(findConnection(remoteAddress).sock, data);
  }

  if (port === 7003) {
    return handler(findConnection(remoteAddress), data);
  }

  if (port === 43300) {
    return handler(findConnection(remoteAddress), data);
  }

  /**
   * TODO: Create a fallback handler
   */
  logger.error(`No known handler for port ${port}, unable to handle the request from ${remoteAddress} on port ${port}, aborting.`);
  logger.info('Data was: ', data.toString('hex'));
  process.exit(1);
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
function deleteConnection(connectionId) {
  connections.filter(conn => conn.id !== connectionId);
}

module.exports = {
  findOrNewConnection,
  processData,
  dumpConnections,
  findConnection,
  deleteConnection,
};
