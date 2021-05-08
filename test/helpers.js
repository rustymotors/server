// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const td = require('testdouble')
const logger = require('../src/services/@mcoserver/mco-logger')
const { ConnectionMgr } = require('../src/services/MCServer/ConnectionMgr')
const { DatabaseManager } = require('../src/shared/DatabaseManager')
const net = require('net')
const { ConnectionObj } = require('../src/services/MCServer/ConnectionObj')
const { MCServer } = require('../src/services/MCServer')

const fakeConfig = {
  serverConfig: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    ipServer: '',
    publicKeyFilename: '',
    connectionURL: ''
  }
}

/**
 * @type {IAppSettings}
 */
const fakeSettings = {

}
module.exports.fakeSettings = fakeSettings

const fakeLogger = td.object(logger)
fakeLogger.child = () => {
  return fakeLogger
}
fakeLogger.info = td.function(logger.info)
fakeLogger.debug = td.function(logger.debug)
fakeLogger.error = td.function(logger.error)

const FakeDatabaseManagerConstructor = td.constructor(DatabaseManager)
const fakeDatabaseManager = new FakeDatabaseManagerConstructor(fakeLogger)

const FakeConnectionManagerConstructor = td.constructor(ConnectionMgr)
const fakeConnectionMgr = new FakeConnectionManagerConstructor(fakeLogger, fakeDatabaseManager)

/**
 * Fake socket for testing
 */
const FakeSocketConstructor = td.constructor(net.Socket)
const fakeSocket = new FakeSocketConstructor()
fakeSocket.localPort = '7003'

/**
 * Fake connectionObj for testing
 */
const FakeConnectionConstructor = td.constructor(ConnectionObj)

const FakeMCServerConstructor = td.constructor(MCServer)
const fakeMCServer = new FakeMCServerConstructor(fakeConfig, fakeDatabaseManager)

module.exports.fakeLogger = fakeLogger
module.exports.FakeConnectionManagerConstructor = FakeConnectionManagerConstructor
module.exports.fakeConnectionMgr = fakeConnectionMgr
module.exports.FakeSocketConstructor = FakeSocketConstructor
module.exports.fakeSocket = fakeSocket
module.exports.FakeConnectionConstructor = FakeConnectionConstructor
