// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { appSettings } from '../config/app-settings'
import { logger } from './shared/logger'
import { AdminServer } from './services/AdminServer/AdminServer'
import { MCServer } from './services/MCServer'
import { DatabaseManager } from './shared/DatabaseManager'
import { IAppSettings } from './types'
import { Logger } from 'winston'

/**
 * Main game server
 * @module Server
 */
export class Server {
  config: IAppSettings
  logger: Logger
  databaseManager: DatabaseManager
  mcServer: MCServer | undefined
  adminServer: AdminServer | undefined
  /**
   * @param {module:DatabaseManager} databaseManager
   */
  constructor (databaseManager: DatabaseManager) {
    this.config = appSettings
    this.logger = logger.child({ service: 'mcoserver:Server' })
    this.databaseManager = databaseManager
  }

  /**
   *
   */
  async start (): Promise<void> {
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
