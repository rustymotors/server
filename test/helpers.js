// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import td from 'testdouble'
import { logger } from '../src/shared/logger'
import { ConnectionMgr } from '../src/services/MCServer/ConnectionMgr'
import { DatabaseManager } from '../src/shared/DatabaseManager'
import net from 'net'
import { ConnectionObj } from '../src/services/MCServer/ConnectionObj'
import { MCServer } from '../src/services/MCServer'

export const fakeConfig = {
  serverConfig: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    ipServer: '',
    publicKeyFilename: '',
    connectionURL: ''
  }
}

export const fakeLogger = td.object(logger)
exports.fakeLogger = fakeLogger
exports.fakeLogger.child = () => {
  return exports.fakeLogger
}

export const FakeDatabaseManagerConstructor = td.constructor(DatabaseManager)
export const fakeDatabaseManager = new exports.FakeDatabaseManagerConstructor(exports.fakeLogger)

export const FakeConnectionManagerConstructor = td.constructor(ConnectionMgr)
export const fakeConnectionMgr = new exports.FakeConnectionManagerConstructor(exports.fakeLogger, exports.fakeDatabaseManager)

/**
 * Fake socket for testing
 */
export const FakeSocketConstructor = td.constructor(net.Socket)
export const fakeSocket = new exports.FakeSocketConstructor()
fakeSocket.localPort = '7003'

/**
 * Fake connectionObj for testing
 */
export const FakeConnectionConstructor = td.constructor(ConnectionObj)

export const FakeMCServerConstructor = td.constructor(MCServer)
export const fakeMCServer = new exports.FakeMCServerConstructor(exports.fakeConfig, exports.fakeDatabaseManager)
