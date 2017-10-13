/* Internal dependencies */
const logger = require('./logger.js')
const http = require('./http.js')
const nps = require('./nps.js')
const config = require('../config.json')


/**
Need to open create listeners on the ports

When a connection opens, cass it to a session controller that will log the
connection and fork to a connection handlers
**/

function startServers() {
    /* Start the NPS servers */
    http.start((err) => {
        if (err) { throw err }
        logger.info('HTTP Servers started')
    })

    nps.start((err) => {
        if (err) { throw err }
        logger.info('TCP Servers started')
    })
}

module.exports = {
    startServers,
}
