const crypto = require('crypto')
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

  const packetcontent = crypto.randomBytes(516)

  const packetresult = packet.buildPacket(512, 0x3100, packetcontent)
  util.dumpResponse(packetresult, packetresult.length)
  return packetresult
}

module.exports = {
  getDbMsgId,
  msgClientConnect,
}
