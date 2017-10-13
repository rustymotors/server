/* Internal dependencies */
const logger = require('./logger.js')
const http = require('./http.js')
const nps = require('./nps.js')
const config = require('../config.json')

function startServers() {
    logger.level = config.loggerLevel
    /* Start the NPS servers */
    http.start(config.serverConfig, (err) => {
        if (err) { throw err }
        logger.info('HTTP Servers started')
    })

    nps.start(config.serverConfig, (err) => {
        if (err) { throw err }
        logger.info('TCP Servers started')
    })
}

module.exports = {
    startServers,
}
