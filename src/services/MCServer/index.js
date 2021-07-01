// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { debug, log } from '@drazisil/mco-logger'
import config from '../../../config/index.js'
import { ListenerThread } from '../MCServer/listener-thread.js'
import { ConnectionMgr } from './connection-mgr.js'

/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */

/**
 * @class
 * @property {config.config} config
 * @property {ConnectionMgr} mgr
 */
export class MCServer {
  /**
   *
   * @param {DatabaseManager} databaseManager
   */
  constructor(databaseManager) {
    this.config = config
    this.mgr = new ConnectionMgr(databaseManager, this.config)
    this.serviceName = 'mcoserver:MCServer'
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */

  async startServers() {
    const listenerThread = new ListenerThread()
    log('Starting the listening sockets...', { service: this.serviceName })
    const tcpPortList = [
      6660, 8228, 8226, 7003, 8227, 43_200, 43_300, 43_400, 53_303, 9000, 9001,
      9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013,
      9014,
    ]

    for (const port of tcpPortList) {
      listenerThread.startTCPListener(port, this.mgr)
      debug(`port ${port} listening`, { service: this.serviceName })
    }

    log('Listening sockets create successfully.', { service: this.serviceName })
  }
}
