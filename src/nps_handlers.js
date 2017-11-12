const lobby = require("./lobby.js");
const logger = require("./logger.js");
const util = require("./nps_utils.js");
const tcpManager = require("./TCPManager.js").TCPManager();

const MessageNode = require("./MessageNode.js");

function getRequestCode(rawBuffer) {
  return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`;
}

function lobbyDataHandler(con, rawData) {
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case "0100": {
      const packetresult = lobby.npsRequestGameConnectServer(con.sock, rawData);
      con.sock.write(packetresult);
      break;
    }
    // npsHeartbeat
    case "0217": {
      const packetresult = util.npsHeartbeat(con.sock, rawData);
      con.sock.write(packetresult);
      break;
    }
    // npsSendCommand
    case "1101": {
      // This is an encrypted command
      // Fetch session key

      con = lobby.sendCommand(con, rawData, requestCode);
      break;
    }
    default:
      util.dumpRequest(con.sock, rawData, requestCode);
      logger.error(`Unknown code ${requestCode} was recieved on port 7003`);
  }
}

function handler(con, rawData) {
  const messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Recieved packet on port ${con.sock.localPort} from ${con.sock
    .remoteAddress}...`);
  logger.info("=============================================");

  if (messageNode.isMCOTS()) {
    logger.debug("Packet has a valid MCOTS header signature");
    logger.info("=============================================");
    logger.debug("Header Length: ", messageNode.header.length);
    logger.debug("Header MCOSIG: ", messageNode.isMCOTS());
    logger.debug("Sequence: ", messageNode.seq);
    logger.debug("Flags: ", messageNode.flags);
    logger.debug("Buffer: ", messageNode.buffer);
    logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
    logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));
    logger.debug(
      "Raw Buffer as string: ",
      messageNode.rawBuffer.toString("hex")
    );
    logger.info("=============================================");

    tcpManager.MessageReceived(messageNode, con);
  } else {
    //tcpManager.MessageReceived(messageNode, con)
    logger.debug("No valid MCOTS header signature detected, sending to Lobby");
    logger.info("=============================================");
    //logger.debug("Header Length: ", messageNode.header.length);
    //logger.debug("Buffer: ", messageNode.buffer);
    //logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
    //logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));
    //logger.info("=============================================");
    lobbyDataHandler(con, rawData);
  }
}

module.exports = {
  lobbyDataHandler,
  handler,
};
