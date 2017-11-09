const logger = require("./logger.js");
const packet = require("./packet.js");

function toHex(d) {
  const hexByte = `0${Number(d).toString(16)}`;
  return `${hexByte.slice(-2).toUpperCase()}`;
}

function dumpRequest(socket, rawBuffer) {
  const localId = `${socket.remoteAddress}_${socket.localPort}`;
  const requestCode = `${toHex(rawBuffer[0])}${toHex(rawBuffer[1])}`;
  logger.debug(`\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  Request from: ${socket.remoteAddress} on ${socket.localPort}
  Request Code: ${requestCode}
  -----------------------------------------
  Request DATA ${localId}:${rawBuffer.toString("ascii")}
  =========================================
  Request DATA ${localId}:${rawBuffer.toString("hex")}
  -----------------------------------------
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`);
}

function dumpResponse(data, count) {
  logger.debug(`Response Length: ${data.length}`);
  let responseBytes = "";
  for (let i = 0; i < count && i < data.length; i += 1) {
    responseBytes += ` ${toHex(data[i])}`;
  }
  logger.debug(`Response Bytes: ${responseBytes}\n
    -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`);
}

function npsHeartbeat(session, rawData) {
  dumpRequest(session.lobbySocket, rawData);

  const packetcontent = Buffer.alloc(8);
  const packetresult = packet.buildPacket(8, 0x0127, packetcontent);
  dumpResponse(packetresult, 8);
  return packetresult;
}

module.exports = {
    toHex,
    dumpRequest,
    dumpResponse,
    npsHeartbeat
}

