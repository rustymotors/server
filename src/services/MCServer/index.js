// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { logger } = require('../../shared/logger')
const { ListenerThread } = require('./listenerThread')
const { ConnectionMgr } = require('./ConnectionMgr')
const { appSettings } = require('../../../config/app-settings')
const { DatabaseManager } = require('../../shared/DatabaseManager') // lgtm [js/unused-local-variable]
const debug = require('debug')

/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */

/**
 * @class
 * @property {IAppSettings} config
 * @property {ConnectionMgr} mgr
 * @property {Logger} logger
 */
module.exports.MCServer = class MCServer {

  /**
   *
   * @param {IAppSettings} config
   * @param {DatabaseManager} databaseManager
   */
  constructor (config, databaseManager) {
    this.config = config
    this.mgr = new ConnectionMgr(logger, databaseManager)
    this.logger = logger.child({ service: 'mcoserver:MCServer' })
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */

  async startServers () {
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
