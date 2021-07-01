// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '@drazisil/mco-logger'
import config from '../config/index.js'
import { AdminServer } from './services/AdminServer/index.js'
import { MCServer } from './services/MCServer/index.js'

/**
 * Main game server
 * @class
 * @property {config.config} config
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
class Server {
  /**
   * @param {DatabaseManager} databaseManager
   */
  constructor(databaseManager) {
    this.config = config
    this.databaseManager = databaseManager
    this.serviceName = 'mcoserver:Server'
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    log('Starting servers...', { service: 'mcoserver:Server' })

    // Start the MC Server
    this.mcServer = new MCServer(this.databaseManager)
    this.mcServer.startServers()

    // Start the Admin server
    this.adminServer = new AdminServer(this.mcServer)
    await this.adminServer.start(this.config)
    log('Web Server started', { service: 'mcoserver:Server' })

    log('Servers started, ready for connections.', {
      service: 'mcoserver:Server',
    })
  }
}

const _Server = Server
export { _Server as Server }
