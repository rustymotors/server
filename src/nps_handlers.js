const lobby = require("./lobby.js");
const login = require("./login.js");
const logger = require("./logger.js");
const mcots = require("./mcots.js");
const persona = require("./persona.js");
const util = require("./nps_utils.js");
const tcpManager = require("./TCPManager.js").TCPManager();

const MessageNode = require("./MessageNode.js");

function getRequestCode(rawBuffer) {
  return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`;
}

function loginDataHandler(session, rawData) {
  let loginSession;
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsUserLogin
    case "0501": {
      const s = session;
      loginSession = login.userLogin(s, rawData);

      // Update the onData handler with the new session
      s.loginSocket.removeListener("data", loginDataHandler);
      s.loginSocket.on("data", data => {
        loginDataHandler(loginSession, data);
      });
      s.loginSocket.write(loginSession.packetresult);
      break;
    }
    default:
      util.dumpRequest(session.loginSocket, rawData, requestCode);
      logger.error(`Unknown code ${requestCode} was recieved on port 8226`);
  }
  return loginSession;
}

function personaDataHandler(session, rawData) {
  const s = session;
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsSelectGamePersona
    case "0503": {
      const packetresult = persona.npsSelectGamePersona(s, rawData);
      session.personaSocket.write(packetresult);
      break;
    }
    // npsLogoutGameUser
    case "050F": {
      const p = persona.npsLogoutGameUser(s, rawData);
      //s.loggedIntoLobby = false;
      s.personaSocket.write(p);
      break;
    }
    // npsGetPersonaMaps
    case "0532": {
      const packetresult = persona.npsGetPersonaMaps(session, rawData);
      s.personaSocket.write(packetresult);
      break;
    }
    // npsValidatePersonaName
    case "0533": {
      const packetresult = persona.npsValidatePersonaName(s, rawData);
      s.personaSocket.write(packetresult);
      break;
    }
    // NPSCheckToken
    case "0534": {
      const packetresult = persona.npsCheckToken(s, rawData);
      s.personaSocket.write(packetresult);
      break;
    }
    // NPSGetPersonaInfoByName
    case "0519": {
      const packetresult = persona.NPSGetPersonaInfoByName(s, rawData);
      s.personaSocket.write(packetresult);

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
      break;
    }
    default:
      util.dumpRequest(session.personaSocket, rawData, requestCode);
      throw new Error(`Unknown code ${requestCode} was recieved on port 8228`);
  }
  return s;
}

function lobbyDataHandler(session, rawData) {
  const s = session;
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsRequestGameConnectServer
    case "0100": {
      const packetresult = lobby.npsRequestGameConnectServer(s, rawData);
      s.lobbySocket.write(packetresult);
      break;
    }
    // npsHeartbeat
    case "0217": {
      const packetresult = util.npsHeartbeat(s, rawData);
      s.lobbySocket.write(packetresult);
      break;
    }
    // npsSendCommand
    case "1101": {
      const cmd = lobby.sendCommand(s, rawData, requestCode);
      s.lobbySocket.write(cmd.encryptedCommand);
      break;
    }
    default:
      util.dumpRequest(session.lobbySocket, rawData, requestCode);
      logger.error(`Unknown code ${requestCode} was recieved on port 7003`);
  }
  return s;
}

function databaseDataHandler(session, rawData) {
  messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Recieved packet on port ${session.databaseSocket.localPort} from ${session
    .databaseSocket.remoteAddress}...`);
  logger.debug("Header Length: ", messageNode.header.length);
  logger.debug("Header MCOSIG: ", messageNode.header.mcosig);
  logger.debug("Sequence: ", messageNode.seq);
  logger.debug("Flags: ", messageNode.flags);
  logger.debug("Buffer: ", messageNode.buffer);
  logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));
  logger.info(`=============================================`);

  if (messageNode.header.mcosig == "TOMC") {
    logger.debug(`Packet has a valid MCOTS header signature`);
  }

  // Check if this is an unencrypted packet
  if (messageNode.flags == 0) {
    const requestCode = Buffer.from([
      messageNode.buffer[0],
      messageNode.buffer[1]
    ]).toString("hex");

    switch (requestCode) {
      case "b601": {
        const packetresult = mcots.msgClientConnect(session, rawData);
        session.databaseSocket.write(packetresult);
        break;
      }
      default:
        //util.dumpRequest(session.databaseSocket, rawData, requestCode);
        logger.error(
          `Unknown packet  ${requestCode} was recieved on port 43300`
        );
        return;
    }
  } else if (messageNode.flags == 8) {
    // Packet is encrypted
    const decryptedBuffer = session.enc.decodeBuffer(messageNode.buffer);
    logger.error(`Unknown encrypted packet was recieved on port 43300`);
    logger.debug("Using sKey: ", session.sKey);
    logger.debug("Attempt at decrypting: ", decryptedBuffer);
  } else {
    // Unknown packet
    logger.error(`Unknown packet was recieved on port 43300`);
  }

  //
  //
  // const msgId = mcots.getDbMsgId(rawData);
  // //logger.info(`Db message ID ${msgId} was recieved on port 43300`);
  //
  // switch (requestCode) {
  //   case "0D01": // #440 MC_TRACKING_MSG
  //   //util.dumpRequest(session.databaseSocket, rawData, requestCode);
  //   // break;
  //   // #438 MC_CLIENT_CONNECT_MSG
  //   case "3100": {
  //     //const packetresult = mcots.msgClientConnect(session, rawData);
  //     //session.databaseSocket.write(packetresult);
  //     //break;
  //   }
  //   default:
  //     //util.dumpRequest(session.databaseSocket, rawData, requestCode);
  //     logger.error(`Unknown code ${requestCode} was recieved on port 43300`);
  // }
}

function handler(con, rawData) {
  messageNode = MessageNode.MessageNode(rawData);
  logger.info(`=============================================
    Recieved packet on port ${con.sock.localPort} from ${con.sock
    .remoteAddress}...`);
  logger.debug("Header Length: ", messageNode.header.length);
  logger.debug("Header MCOSIG: ", messageNode.header.mcosig);
  logger.debug("Sequence: ", messageNode.seq);
  logger.debug("Flags: ", messageNode.flags);
  logger.debug("Buffer: ", messageNode.buffer);
  logger.debug("Buffer as text: ", messageNode.buffer.toString("utf8"));
  logger.debug("Buffer as string: ", messageNode.buffer.toString("hex"));
  logger.info(`=============================================`);

  if (messageNode.header.mcosig == "TOMC") {
    logger.debug(`Packet has a valid MCOTS header signature`);
    tcpManager.MessageReceived(messageNode, con);
  } else {
    tcpManager.MessageReceived(messageNode, con);
  }
}

module.exports = {
  loginDataHandler,
  personaDataHandler,
  lobbyDataHandler,
  databaseDataHandler,
  handler
};
