// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { appSettings } = require('../config/app-settings')
const { AdminServer } = require('./services/AdminServer/AdminServer')
const { MCServer } = require('./services/MCServer')
const logger = require('./services/@mcoserver/mco-logger').child({ service: 'mcoserver:Server' })

/**
 * Main game server
 * @class
 * @property {IAppSettings} config
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
class Server {
  /**
   * @param {DatabaseManager} databaseManager
   */
  constructor (databaseManager) {
    this.config = appSettings
    this.databaseManager = databaseManager
  }

  /**
   * @returns {Promise<void>}
   */
  async start () {
    logger.info('Starting servers...')

    // Start the MC Server
    this.mcServer = new MCServer(appSettings, this.databaseManager)
    this.mcServer.startServers()

    // Start the Admin server
    this.adminServer = new AdminServer(this.mcServer)
    await this.adminServer.start(this.config.serverConfig)
    logger.info('Web Server started')

    logger.info('Servers started, ready for connections.')
  }
}

module.exports.Server = Server
