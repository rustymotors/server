const crypto = require('crypto')
const logger = require('./logger.js')
const packet = require('./packet.js')
const util = require('./nps_utils.js')

function decryptSessionKey(session, encryptedKeySet) {
    const s = session
    try {
        const encryptedKeySetB64 = Buffer.from(encryptedKeySet.toString('utf8'), 'hex').toString('base64')
        const decrypted = s.privateKey.decrypt(encryptedKeySetB64, 'base64')
        s.sessionKey = Buffer.from(Buffer.from(decrypted, 'base64').toString('hex').substring(4, 20), 'hex')
        const desIV = Buffer.alloc(8)
        s.cypher = crypto.createCipheriv('des-cbc', Buffer.from(s.sessionKey, 'hex'), desIV).setAutoPadding(false)
        s.decypher = crypto.createDecipheriv('des-cbc', Buffer.from(s.sessionKey, 'hex'), desIV).setAutoPadding(false)
        logger.debug('decrypted: ', s.sessionKey)
    } catch (e) {
        logger.error(e)
    }
    return s
}

function userLogin(session, data) {
    const s = session

    util.dumpRequest(s.loginSocket, data)
    const contextId = Buffer.alloc(34)
    data.copy(contextId, 0, 14, 48)
    const customer = util.npsGetCustomerIdByContextId(contextId)

    // Create the packet content
    // packetcontent = crypto.randomBytes(44971)
    // packetcontent = crypto.randomBytes(516)
    const packetcontent = packet.premadeLogin()

    // This is needed, not sure for what
    Buffer.from([0x01, 0x01]).copy(packetcontent)

    // load the customer id
    customer.customerId.copy(packetcontent, 10)

    // Don't use queue?
    Buffer.from([0x00]).copy(packetcontent, 207)
    // Don't use queue? (debug)
    Buffer.from([0x00]).copy(packetcontent, 463)

    // Set response Code 0x0601 (debug)
    packetcontent[255] = 0x06
    packetcontent[256] = 0x01

    // For debug
    packetcontent[257] = 0x01
    packetcontent[258] = 0x01


    // load the customer id (debug)
    customer.customerId.copy(packetcontent, 267)

    // Build the packet
    // packetresult = packet.buildPacket(44975, 0x0601, packetcontent)
    const packetresult = packet.buildPacket(516, 0x0601, packetcontent)

    util.dumpResponse(packetresult, 516)

    const loginSession = decryptSessionKey(s, data.slice(52, -10))

    loginSession.packetresult = packetresult

    return loginSession
}

module.exports = {
    userLogin,
}
