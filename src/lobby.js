const crypto = require("crypto");
const logger = require("./logger.js");
const packet = require("./packet.js");
const util = require("./nps_utils.js");
const MsgPack = require("./MsgPack.js");

const database = require("../lib/database/index.js");

// typedef struct _NPS_LoginInfo
// {
//   NPS_UserInfo UserData;           // The UserInfo for the login
//   NPS_CUSTOMERID CustomerId;       // The global ID across all of NPS
//   char keyHash [NPS_HASHED_KEY_LEN];
//   char HostName[NPS_HOSTNAME_LEN]; // Name of the users computer (64)
//   char MyIpAddr[NPS_IPADDR_LEN];   // IP address of the users computer (16)
//   unsigned long Flags;             // The initial flags for the server (4)
//   char Version[NPS_VERSION_LEN + 1]; // Version string (33)
// }
// NPS_LoginInfo;
function npsRequestGameConnectServer(socket, rawData) {
  // Load the recieved data into a MsgPack class
  const msgPack = MsgPack(rawData);
  logger.debug(msgPack.GetOpCode());
  logger.debug(msgPack.GetMsgLen());

  util.dumpRequest(socket, rawData);
  // const contextId = Buffer.alloc(34)
  // data.copy(contextId, 0, 14, 48)
  // const customer = nps.npsGetCustomerIdByContextId(contextId)
  // logger.debug(`customer: ${customer}`)

  // Return a _NPS_UserInfo structure - 40
  const packetcontent = Buffer.alloc(38);

  // MsgLen
  Buffer.from([0x00, 0x04]).copy(packetcontent);

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x00, 0x00, 0x02]).copy(packetcontent, 2);

  // User name (32)
  const name = Buffer.alloc(32);
  Buffer.from("Doctor Brown", "utf8").copy(name);
  name.copy(packetcontent, 6);

  // UserData - User controllable data (64)
  Buffer.alloc(64).copy(packetcontent, 38);

  // Build the packet
  const packetresult = packet.buildPacket(4, 0x0120, packetcontent);

  util.dumpResponse(packetresult, packetresult.length);
  return packetresult;
}

function fetchSessionKeyByRemoteAddress(remoteAddress, callback) {
  database.db.serialize(function() {
    database.db.get(
      "SELECT session_key, s_key FROM sessions WHERE remote_address = $1",
      [remoteAddress],
      (err, res) => {
        if (err) {
          // Unknown error
          console.error(
            `DATABASE ERROR: Unable to retrieve sessionKey: ${err.message}`
          );
          callback(err);
        } else {
          callback(null, res);
        }
      }
    );
  });
}

function decryptCmd(session, cypherCmd) {
  const s = session;
  logger.debug(`raw cmd: ${cypherCmd.toString("hex")}`);
  const decryptedCommand = s.decypher.update(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  return s;
}

function encryptCmd(session, cypherCmd) {
  const s = session;
  // logger.debug('raw cmd: ' + cypherCmd + cypherCmd.length)
  s.encryptedCommand = s.cypher.update(cypherCmd);
  return s;
}

function sendCommand(con, data) {
  fetchSessionKeyByRemoteAddress(con.sock.remoteAddress, (err, res) => {
    if (err) {
      throw err;
    }

    let s = con;

    logger.debug("Retrieved Session Key: ", res.session_key);
    logger.debug("Retrieved S Key: ", res.s_key);

    // Create the cypher and decyper only if not already set
    if (!s.cypher & !s.decypher) {
      const desIV = Buffer.alloc(8);
      s.cypher = crypto
        .createCipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
      s.decypher = crypto
        .createDecipheriv("des-cbc", Buffer.from(res.s_key, "hex"), desIV)
        .setAutoPadding(false);
    }

    const cmd = decryptCmd(s, new Buffer(data.slice(4)));
    logger.debug(`decryptedCmd: ${cmd.decryptedCmd.toString("hex")}`);

    util.dumpRequest(con.sock, data);

    // Create the packet content
    const packetcontent = crypto.randomBytes(375);
    // const packetcontent = Buffer.from([0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19,
    //  0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19])

    // This is needed, not sure for what
    // Buffer.from([0x01, 0x01]).copy(packetcontent)

    // Add the response code
    packetcontent.writeUInt16BE(0x0219, 367);
    packetcontent.writeUInt16BE(0x0101, 369);
    packetcontent.writeUInt16BE(0x022c, 371);

    // Build the packet
    // const packetresult = packet.buildPacket(32, 0x0401,
    const packetresult = packet.buildPacket(32, 0x0229, packetcontent);

    util.dumpResponse(packetresult, packetresult.length);

    const cmdEncrypted = encryptCmd(s, packetresult);

    cmdEncrypted.encryptedCommand = Buffer.concat([
      Buffer.from([0x11, 0x01]),
      cmdEncrypted.encryptedCommand,
    ]);

    logger.debug(
      `encryptedResponse: ${cmdEncrypted.encryptedCommand.toString("hex")}`
    );
    con.sock.write(cmdEncrypted.encryptedCommand);
    return con;
  });
}

module.exports = {
  npsRequestGameConnectServer,
  sendCommand,
};
