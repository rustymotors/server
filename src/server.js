// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { AdminServer } = require('./services/AdminServer/AdminServer')
const { Logger } = require('./services/shared/loggerManager')
const { ConfigManager } = require('./services/shared/configManager')
const { MCServer } = require('./services/MCServer')

/**
 *
 */
class Server {
  /**
   *
   */
  constructor () {
    this.config = new ConfigManager().getConfig()
    this.logger = new Logger().getLogger('Server')
  }

  /**
   *
   */
  async start () {
    this.logger.info('Starting servers...')

    // Start the MC Server
    this.mcServer = new MCServer()
    this.mcServer.startServers(this.config)

    // Start the Admin server
    this.adminServer = new AdminServer(this.mcServer)
    this.adminServer.start(this.config.serverConfig)
    this.logger.info('[adminServer] Web Server started')

    this.logger.info('Servers started, ready for connections.')
  }
}

module.exports = {
  Server
}
