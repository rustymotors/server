/* Internal dependencies */
const logger = require('./logger.js')
const http = require('./http.js')
const nps = require('./nps.js')
const configuration = require('./config.js')

function startServers(config) {
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
    loadConfig: configuration.loadConfig,
    startServers,
}
