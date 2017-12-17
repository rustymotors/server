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

const async = require("async");
const net = require("net");
const logger = require("../../src/logger.js");
const packet = require("../../src/packet.js");

const NPS_UserStatus = require("./NPS_UserStatus.js");

const database = require("../database/index.js");

function updateSessionKey(customerId, sessionKey, contextId, remoteAddress) {
  const sKey = sessionKey.substr(0, 16);

  database.db.serialize(function() {
    database.db.run(
      "INSERT OR REPLACE INTO sessions (customer_id, session_key, s_key, context_id, remote_address) VALUES ($1, $2, $3, $4, $5)",
      [customerId, sessionKey, sKey, contextId, remoteAddress],
      (err, results) => {
        if (err) {
          // Unknown error
          logger.error(
            `DATABASE ERROR: Unable to store sessionKey: ${err.message}`
          );
          logger.error("Error updating session key...");
          logger.error(err.message);
          logger.error(err.stack);
          process.exit(1);
        }
        logger.debug(
          `DATABASE: Updated ${customerId} session with session key ${sessionKey}`
        );
        return;
      }
    );
  });
}

function npsGetCustomerIdByContextId(contextId) {
  const users = {
    d316cd2dd6bf870893dfbaaf17f965884e: {
      userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
      customerId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
    },
    "5213dee3a6bcdb133373b2d4f3b9962758": {
      userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
      customerId: Buffer.from([0xac, 0x01, 0x00, 0x00]),
    },
  };
  if (contextId.toString() === "") {
    logger.error(`Unknown contextId: ${contextId.toString()}`);
    process.exit(1);
  }
  return users[contextId.toString()];
}

/**
 * Process a UserLogin packet
 * Return a NPS_Serialize
 * @param {Socket} socket 
 * @param {Buffer} data 
 */
function userLogin(socket, data) {
  const npsUserStatus = NPS_UserStatus(socket, data);

  logger.info("*** userLogin ****");
  logger.debug("Packet as hex: ", data.toString("hex"));

  logger.info(`=============================================
    Received login packet on port ${socket.localPort} from ${socket.remoteAddress}...`);
  logger.debug("NPS opCode: ", npsUserStatus.opCode);
  logger.debug("contextId:", npsUserStatus.contextId);
  logger.debug("Decrypted SessionKey: ", npsUserStatus.sessionKey);
  logger.info("=============================================");

  // Load the customer record by contextId
  // TODO: This needs to be from a database, right now is it static
  const customer = npsGetCustomerIdByContextId(npsUserStatus.contextId);

  // Save sessionKey in database under customerId
  updateSessionKey(
    customer.customerId.readInt32BE(),
    npsUserStatus.sessionKey.toString("hex"),
    npsUserStatus.contextId,
    socket.remoteAddress
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
  logger.debug("Full response packet length: ", fullPacket.length);
  logger.debug("Full response packet as string: ", fullPacket.toString("hex"));
  return fullPacket;
}

function loginDataHandler(socket, rawData) {
  // TODO: Check if this can be handled by a MessageNode object
  const requestCode = rawData.readUInt16BE().toString(16);

  switch (requestCode) {
    // npsUserLogin
    case "501": {
      const responsePacket = userLogin(socket, rawData);

      socket.write(responsePacket);
      break;
    }
    default:
      logger.error(`Unknown code ${requestCode} was received on port 8226`);
  }
}

module.exports = { loginDataHandler };
