// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { appSettings } from '../config/app-settings'
import { AdminServer } from './services/AdminServer/AdminServer'
import { MCServer } from './services/MCServer'
import { DatabaseManager } from './shared/DatabaseManager' // lgtm [js/unused-local-variable]
import { logger } from './shared/logger'


/**
 * Main game server
 * @class
 * @property {IAppSettings} config
 * @property {Logger} logger
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
export class Server {
  config
  logger
  databaseManager
  mcServer
  adminServer

  /**
   * @param {DatabaseManager} databaseManager
   */
  constructor (databaseManager) {
    this.config = appSettings
    this.logger = logger.child({ service: 'mcoserver:Server' })
    this.databaseManager = databaseManager
  }

  /**
   * @returns {Promise<void>}
   */
  async start () {
    this.logger.info('Starting servers...')

    // Start the MC Server
    this.mcServer = new MCServer(appSettings, this.databaseManager)
    this.mcServer.startServers()

    // Start the Admin server
    this.adminServer = new AdminServer(this.mcServer)
    await this.adminServer.start(this.config.serverConfig)
    this.logger.info('Web Server started')

    this.logger.info('Servers started, ready for connections.')
  }
}

module.exports = {
  Server
}
