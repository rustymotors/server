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

const { logger } = require('../logger');
const packet = require('./packet');

const { NPSUserStatus } = require('./npsUserStatus');

const { Connection } = require("../Connection");
const pool = require("../database");

function npsGetCustomerIdByContextId(contextId) {

  const users = [
    {
      contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
      customerId: Buffer.from([0xac, 0x01, 0x00, 0x00]),
      userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
    },
    {
      contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
      customerId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      userId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
    },
  ];
  if (contextId.toString() === '') {
    logger.error(`Unknown contextId: ${contextId.toString()}`);
    process.exit(1);
  }
  const userRecord = users.filter((user) => {
    return user.contextId === contextId
  })
  return userRecord[0]
}

async function updateSessionKey(customerId, sessionKey, contextId, connectionId) {
  const sKey = sessionKey.substr(0, 16);
  return pool.connect().then(pool.query(
    `INSERT INTO sessions (customer_id, session_key, s_key, context_id, 
    connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5`,
    [customerId, sessionKey, sKey, contextId, connectionId])
  ).catch((e) => { console.trace(e); });
}

/**
 * Process a UserLogin packet
 * Return a NPS_Serialize
 * @param {Connection} connection
 * @param {Buffer} data
 */
async function userLogin(connection, data, config) {
  const { sock } = connection;
  const userStatus = new NPSUserStatus(config, data);

  logger.info('*** userLogin ****');
  // logger.debug("Packet as hex: ", data.toString("hex"));

  logger.info(`=============================================
    Received login packet on port ${connection.localPort} from ${connection.remoteAddress}...`);
  logger.debug('NPS opCode: ', userStatus.opCode.toString());
  logger.debug('contextId:', userStatus.contextId);
  logger.debug('Decrypted SessionKey: ', userStatus.sessionKey);
  logger.info('=============================================');

  // Load the customer record by contextId
  // TODO: This needs to be from a database, right now is it static
  const customer = npsGetCustomerIdByContextId(userStatus.contextId);

  // Save sessionKey in database under customerId
  await updateSessionKey(
    customer.customerId.readInt32BE(0),
    userStatus.sessionKey,
    userStatus.contextId,
    connection.id,
  );

  // Create the packet content
  // TODO: This needs to be dynamically generated, right now we are using a
  // a static packet that works _most_ of the time
  const packetContent = packet.premadeLogin();

  // MsgId: 0x601
  Buffer.from([0x06, 0x01]).copy(packetContent);

  // Packet length: 0x0100 = 256
  Buffer.from([0x01, 0x00]).copy(packetContent, 2);

  // load the customer id
  customer.customerId.copy(packetContent, 12);

  // Don't use queue (+208, but I'm not sure if this includes the header or not)
  Buffer.from([0x00]).copy(packetContent, 208);

  /**
   * Return the packet twice for debug
   * Debug sends the login request twice, so we need to reply twice
   * Then send ok to login packet
   */
  const fullPacket = Buffer.concat([packetContent, packetContent]);
  // logger.debug("Full response packet length: ", fullPacket.length);
  // logger.debug("Full response packet as string: ", fullPacket.toString("hex"));
  return fullPacket;
}

async function loginDataHandler(rawPacket, config) {
  const { connection, data } = rawPacket;
  // TODO: Check if this can be handled by a MessageNode object
  const { sock } = connection;
  const requestCode = data.readUInt16BE(0).toString(16);

  switch (requestCode) {
    // npsUserLogin
    case '501': {
      const responsePacket = await userLogin(connection, data, config);

      logger.debug("responsePacket's data prior to sending: ", responsePacket.toString("hex"))
      sock.write(responsePacket);
      break;
    }
    default:
      logger.error(`LOGIN: Unknown code ${requestCode} was received on port 8226`);
      process.exit();
  }
  return connection;
}

module.exports = { npsGetCustomerIdByContextId, userLogin, loginDataHandler }