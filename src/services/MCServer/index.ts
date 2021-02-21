// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from '../../shared/logger'
import { ListenerThread } from './listenerThread'
import { ConnectionMgr } from './ConnectionMgr'
import { appSettings } from '../../../config/app-settings'
import { IAppSettings } from '../../types'
import { Logger } from 'winston'
import { DatabaseManager } from '../../shared/DatabaseManager'
import debug from 'debug'

/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */

export class MCServer {
  config: IAppSettings
  mgr: ConnectionMgr
  logger: Logger

  /**
   *
   * @constructor
   * @param {IAppSettings} config
   * @param {module:DatabaseManager.DatabaseManager} databaseManager
   */
  constructor (config: IAppSettings, databaseManager: DatabaseManager) {
    this.config = config
    this.mgr = new ConnectionMgr(logger, databaseManager)
    this.logger = logger.child({ service: 'mcoserver:MCServer' })
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   *
   */

  async startServers (): Promise<void> {
    const listenerThread = new ListenerThread(appSettings, logger.child({ service: 'mcoserver:ListenerThread' }))
    this.logger.info('Starting the listening sockets...')
    const tcpPortList = [
      6660,
      8228,
      8226,
      7003,
      8227,
      43200,
      43300,
      43400,
      53303,
      9000,
      9001,
      9002,
      9003,
      9004,
      9005,
      9006,
      9007,
      9008,
      9009,
      9010,
      9011,
      9012,
      9013,
      9014
    ]

    tcpPortList.forEach(port => {
      listenerThread.startTCPListener(port, this.mgr)
      debug('mcoserver:MCServer')(`port ${port} listening`)
    })
    this.logger.info('Listening sockets create successfully.')
  }
}
