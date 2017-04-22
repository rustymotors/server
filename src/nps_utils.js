const logger = require('./logger.js')
const packet = require('./packet.js')

function toHex(d) {
    const hexByte = `0${Number(d).toString(16)}`
    return `${hexByte.slice(-2).toUpperCase()}`
}

function dumpRequest(socket, rawBuffer) {
    const requestCode = `${toHex(rawBuffer[0])}${toHex(rawBuffer[1])}`
    logger.debug(`\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  Request from: ${socket.localId}
  Request Code: ${requestCode}
  -----------------------------------------
  Request DATA ${socket.localId}:${rawBuffer.toString('ascii')}
  =========================================
  Request DATA ${socket.localId}:${rawBuffer.toString('hex')}
  -----------------------------------------
  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`)
}

function dumpResponse(data, count) {
    logger.debug(`Response Length: ${data.length}`)
    let responseBytes = ''
    for (let i = 0; (i < count && i < data.length); i += 1) {
        responseBytes += ` ${toHex(data[i])}`
    }
    logger.debug(`Response Bytes: ${responseBytes}\n
    -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n`)
}

function npsGetCustomerIdByContextId(contextId) {
    switch (contextId.toString()) {
    case 'd316cd2dd6bf870893dfbaaf17f965884e':
        return {
            userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
            customerId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        }
    case '5213dee3a6bcdb133373b2d4f3b9962758':
        return {
            userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
            customerId: Buffer.from([0xAC, 0x01, 0x00, 0x00]),
        }
    default:
        logger.error(`Unknown contextId: ${contextId.toString()}`)
        process.exit(1)
        return null
    }
}

function npsHeartbeat(session, rawData) {
    dumpRequest(session.lobbySocket, rawData)

    const packetcontent = Buffer.alloc(8)
    const packetresult = packet.buildPacket(8, 0x0127, packetcontent)
    dumpResponse(packetresult, 8)
    return packetresult
}

module.exports = {
    toHex,
    dumpRequest,
    dumpResponse,
    npsGetCustomerIdByContextId,
    npsHeartbeat,
}
