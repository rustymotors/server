const crypto = require('crypto')
const logger = require('./logger.js')
const packet = require('./packet.js')
const util = require('./nps_utils.js')

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
function npsRequestGameConnectServer(session, rawData) {
    util.dumpRequest(session.lobbySocket, rawData)
  // const contextId = Buffer.alloc(34)
  // data.copy(contextId, 0, 14, 48)
  // const customer = nps.npsGetCustomerIdByContextId(contextId)
  // logger.debug(`customer: ${customer}`)


  // Create the packet content
    const packetcontent = Buffer.alloc(6)

  // Server ID
    Buffer.from([0x00]).copy(packetcontent)

  // This is needed, not sure for what
  // Buffer.from([0x01, 0x01]).copy(packetcontent)

  // if it's 97 it says the username returned is correct
  // if it's 06 it says it's different, but it's random
  // It's parsed by the NPS cipher somehow.
    Buffer.from([0x05]).copy(packetcontent, 1)

    // load the customer id
    Buffer.from([0xAB, 0x01, 0x00, 0x00]).copy(packetcontent, 2)

  // RIFF Count = total packet len - 4 for header
  // Buffer.from([0x00, 0x05]).copy(packetcontent, 1490)

  // Build the packet
    const packetresult = packet.buildPacket(8, 0x0120, packetcontent)

    util.dumpResponse(packetresult, 8)
    return packetresult
}

function decryptCmd(session, cypherCmd) {
    const s = session
    logger.debug(`raw cmd: ${cypherCmd.toString('hex')}`)
    const decryptedCommand = s.decypher.update(cypherCmd)
    s.decryptedCmd = decryptedCommand
    return s
}

function encryptCmd(session, cypherCmd) {
    const s = session
  // logger.debug('raw cmd: ' + cypherCmd + cypherCmd.length)
    s.encryptedCommand = s.cypher.update(cypherCmd)
    return s
}

function sendCommand(session, data) {
    const s = session
    const cmd = decryptCmd(s, new Buffer(data.slice(4)))
    logger.debug(`decryptedCmd: ${cmd.decryptedCmd.toString('hex')}`)
    logger.debug(`cmd: ${cmd.decryptedCmd}`)

    util.dumpRequest(session.lobbySocket, data)

    // Create the packet content
    const packetcontent = crypto.randomBytes(375)
  // const packetcontent = Buffer.from([0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19,
  //  0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19, 0x02, 0x19])

    // This is needed, not sure for what
  // Buffer.from([0x01, 0x01]).copy(packetcontent)

  // Add the response code
    packetcontent.writeUInt16BE(0x0219, 367)
    packetcontent.writeUInt16BE(0x0101, 369)
    packetcontent.writeUInt16BE(0x022C, 371)

    // Build the packet
    const packetresult = packet.buildPacket(32, 0x0229,
    packetcontent)

    util.dumpResponse(packetresult, packetresult.length)

    const cmdEncrypted = encryptCmd(s, packetresult)
    logger.debug(`encryptedResponse: ${cmdEncrypted.encryptedCommand.toString('hex')}`)
    return cmdEncrypted
}

module.exports = {
    npsRequestGameConnectServer,
    sendCommand,
}
