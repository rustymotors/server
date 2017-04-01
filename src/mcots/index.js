// const crypto = require('crypto')
const packet = require('../packet.js')
const util = require('../nps_utils.js')

function getDbMsgId(rawBuffer) {
  // 3100 544f4d4303 00000000 b601
  const msgId = `${util.toHex(rawBuffer[12])}${util.toHex(rawBuffer[11])}`
  switch (msgId) {
    case '01B6':
      return '(01B6) MC_CLIENT_CONNECT_MSG'
    case '01B8':
      return '(01B8) MC_TRACKING_MSG'
    default:
      return `Unknown db msg id: ${msgId}`
  }
}

function msgClientConnect(session, rawData) {
  util.dumpRequest(session.databaseSocket, rawData)

  // const packetcontent = crypto.randomBytes(516)

  // Buffer.from([0x54, 0x4f, 0x4d, 0x43, 0x01, 0x00, 0x00, 0x00, 0x00]).copy(packetcontent, 0)

  // const packetresult = packet.buildPacket(31, 0x3100, packetcontent)

  const packetresult = packet.craftGenericReply()

  util.dumpResponse(packetresult, packetresult.length)
  return packetresult
}

module.exports = {
  getDbMsgId,
  msgClientConnect,
}
