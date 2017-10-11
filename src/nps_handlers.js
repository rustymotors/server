const lobby = require('./lobby.js')
const login = require('./login.js')
const logger = require('./logger.js')
const mcots = require('./mcots.js')
const persona = require('./persona.js')
const util = require('./nps_utils.js')

function getRequestCode(rawBuffer) {
    return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`
}

function loginDataHandler(session, rawData) {
    let loginSession
    const requestCode = getRequestCode(rawData)

    switch (requestCode) {
    // npsUserLogin
    case '0501': {
        const s = session
        loginSession = login.userLogin(s, rawData)

        // Update the onData handler with the new session
        s.loginSocket.removeListener('data', loginDataHandler)
        s.loginSocket.on('data', (data) => {
            loginDataHandler(loginSession, data)
        })
        s.loginSocket.write(loginSession.packetresult)
        break
    }
    default:
        util.dumpRequest(session.loginSocket, rawData, requestCode)
        throw new Error(`Unknown code ${requestCode} was recieved on port 8226`)
    }
    return loginSession
}

function personaDataHandler(session, rawData) {
    const s = session
    const requestCode = getRequestCode(rawData)

    switch (requestCode) {
    // npsSelectGamePersona
    case '0503': {
        const packetresult = persona.npsSelectGamePersona(s, rawData)
        session.personaSocket.write(packetresult)
        break
    }
    // npsLogoutGameUser
    case '050F': {
        const p = persona.npsLogoutGameUser(s, rawData)
        s.loggedIntoLobby = false
        s.personaSocket.write(p)
        break
    }
    // npsGetPersonaMaps
    case '0532': {
        const packetresult = persona.npsGetPersonaMaps(session, rawData)
        s.personaSocket.write(packetresult)
        break
    }
    // npsValidatePersonaName
    case '0533': {
        const packetresult = persona.npsValidatePersonaName(s, rawData)
        s.personaSocket.write(packetresult)
        break
    }
    // NPSCheckToken
    case '0534': {
        const packetresult = persona.npsCheckToken(s, rawData)
        s.personaSocket.write(packetresult)
        break
    }
    // NPSGetPersonaInfoByName
    case '0519': {
        const packetresult = persona.NPSGetPersonaInfoByName(s, rawData)
        s.personaSocket.write(packetresult)

        // Response Code
        // 607 = persona name not available
        // 611 = No error, starter car lot
        // 602 = No error, starter car lot
        break
    }
    default:
        util.dumpRequest(session.personaSocket, rawData, requestCode)
        throw new Error(`Unknown code ${requestCode} was recieved on port 8228`)
    }
    return s
}

function lobbyDataHandler(session, rawData) {
    const s = session
    const requestCode = getRequestCode(rawData)

    switch (requestCode) {
    // npsRequestGameConnectServer
    case '0100': {
        const packetresult = lobby.npsRequestGameConnectServer(s, rawData)
        s.lobbySocket.write(packetresult)
        break
    }
    // npsHeartbeat
    case '0217': {
        const packetresult = util.npsHeartbeat(s, rawData)
        s.lobbySocket.write(packetresult)
        break
    }
    // npsSendCommand
    case '1101': {
        // const cmd = lobby.sendCommand(s, rawData, requestCode)
        // s.lobbySocket.write(cmd.encryptedCommand)
        break
    }
    default:
        util.dumpRequest(session.lobbySocket, rawData, requestCode)
        throw new Error(`Unknown code ${requestCode} was recieved on port 7003`)
    }
    return s
}

// sub_40B933
function databaseDataHandler(session, rawData) {
    // const s = session
    const requestCode = getRequestCode(rawData)
    const msgId = mcots.getDbMsgId(rawData)
    logger.info(`Db message ID ${msgId} was recieved on port 43300`)

    switch (requestCode) {
    case '0D01': // #440 MC_TRACKING_MSG
        util.dumpRequest(session.databaseSocket, rawData, requestCode)
        break
    // #438 MC_CLIENT_CONNECT_MSG
    case '3100': {
        const packetresult = mcots.msgClientConnect(session, rawData)
        session.databaseSocket.write(packetresult)
        break
    }
    default:
        util.dumpRequest(session.databaseSocket, rawData, requestCode)
        throw new Error(`Unknown code ${requestCode} was recieved on port 43300`)
    }
    // return s
}

module.exports = {
    loginDataHandler,
    personaDataHandler,
    lobbyDataHandler,
    databaseDataHandler,
}
