const generalConfiguration = require('../config/general.json')
const serverConfiguration = require('../config/server.json')

function loadConfig() {
    return {
        loggerLevel: generalConfiguration.loggerLevel,
        serverConfig: serverConfiguration,
    }
}

module.exports = {
    loadConfig,
}
