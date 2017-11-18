const async = require("async");
const net = require("net");
const util = require("../../src/nps_utils.js");
const logger = require("../../src/logger.js");
const packet = require("../../src/packet.js");

const LoginPacket = require("./LoginPacket.js");

const database = require("../database/index.js");

function getRequestCode(rawBuffer) {
  return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`;
}

function updateSessionKey(customerId, sessionKey, contextId, remoteAddress) {
  const sKey = sessionKey.substr(0, 16);

  database.db.serialize(function() {
    database.db.run(
      "INSERT OR REPLACE INTO sessions (customer_id, session_key, s_key, context_id, remote_address) VALUES ($1, $2, $3, $4, $5)",
      [customerId, sessionKey, sKey, contextId, remoteAddress],
      (err, results) => {
        if (err) {
          // Unknown error
          console.error(
            `DATABASE ERROR: Unable to store sessionKey: ${err.message}`
          );
          console.error("Error updating session key...");
          console.error(err.message);
          console.error(err.stack);
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
  switch (contextId.toString()) {
    case "d316cd2dd6bf870893dfbaaf17f965884e":
      return {
        userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        customerId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      };
    case "5213dee3a6bcdb133373b2d4f3b9962758":
      return {
        userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        customerId: Buffer.from([0xac, 0x01, 0x00, 0x00]),
      };
    default:
      logger.error(`Unknown contextId: ${contextId.toString()}`);
      process.exit(1);
      return null;
  }
}

function userLogin(socket, data) {
  const loginPacket = LoginPacket(socket, data);

  logger.info(`=============================================
    Recieved login packet on port ${socket.localPort} from ${socket.remoteAddress}...`);
  logger.debug("NPS opCode: ", loginPacket.opCode);
  logger.debug("contextId:", loginPacket.contextId);
  logger.debug("Decrypted SessionKey: ", loginPacket.sessionKey);
  // logger.debug("Buffer as string: ", loginPacket.buffer.toString("ascii"));
  // logger.debug("Buffer as hex: ", loginPacket.buffer.toString("hex"));
  logger.info("=============================================");

  // Load the customer record by contextId
  // TODO: This needs to be from a database, right now is it static
  const customer = npsGetCustomerIdByContextId(loginPacket.contextId);

  // Save sessionKey in database under customerId
  updateSessionKey(
    customer.customerId.readInt32BE(),
    loginPacket.sessionKey.toString("hex"),
    loginPacket.contextId,
    socket.remoteAddress
  );

  // Create the packet content
  // TODO: This needs to be dynamicly generated, right now we are using a
  // a static packet that works _most_ of the time
  const packetcontent = packet.premadeLogin();

  // This is needed, not sure for what
  // TODO: Find out what these bytes mean
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // load the customer id
  customer.customerId.copy(packetcontent, 10);

  // Don't use queue?
  Buffer.from([0x00]).copy(packetcontent, 207);
  // Don't use queue? (debug)
  Buffer.from([0x00]).copy(packetcontent, 463);

  // Set response Code 0x0601 (debug)
  packetcontent[255] = 0x06;
  packetcontent[256] = 0x01;

  // For debug
  packetcontent[257] = 0x01;
  packetcontent[258] = 0x01;

  // load the customer id (debug)
  customer.customerId.copy(packetcontent, 267);

  // Build the packet
  const packetresult = packet.buildPacket(556, 0x0601, packetcontent);

  // util.dumpResponse(packetresult, packetresult.length);

  return packetresult;
}

function loginDataHandler(socket, rawData) {
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsUserLogin
    case "0501": {
      const responsePacket = userLogin(socket, rawData);

      socket.write(responsePacket);
      break;
    }
    default:
      util.dumpRequest(socket, rawData, requestCode);
      logger.error(`Unknown code ${requestCode} was recieved on port 8226`);
  }
}

module.exports = { loginDataHandler };
