// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from 'net'
import td from 'testdouble'
import { ConnectionMgr } from '../src/services/MCServer/connection-mgr.js'
import { DatabaseManager } from '../src/services/shared/database-manager.js'
import { ConnectionObj } from '../src/services/MCServer/connection-obj.js'
import { MCServer } from '../src/services/MCServer/index.js'
const { constructor } = td

/**
 * @property {Object} certificate
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 */
export const fakeConfig = {
  certificate: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    publicKeyFilename: '',
  },
  serverSettings: {
    ipServer: '',
  },
  serviceConnections: {
    databaseURL: '',
  },
  defaultLogLevel: 'warn',
}

const FakeDatabaseManagerConstructor = constructor(DatabaseManager)
export const fakeDatabaseManager = new FakeDatabaseManagerConstructor()

export const FakeMCServerConstructor = constructor(MCServer)
export const fakeMCServer = new FakeMCServerConstructor(
  fakeConfig,
  fakeDatabaseManager,
)

/**
 * @type {IAppSettings}
 */
const fakeSettings = {}
const _fakeSettings = fakeSettings
export { _fakeSettings as fakeSettings }

const FakeConnectionManagerConstructor = constructor(ConnectionMgr)
const fakeConnectionMgr = new FakeConnectionManagerConstructor(
  fakeDatabaseManager,
  fakeSettings,
)

/**
 * Fake socket for testing
 */
const FakeSocketConstructor = constructor(Socket)
const fakeSocket = new FakeSocketConstructor()
fakeSocket.localPort = '7003'
fakeSocket.remoteAddress = '10.1.2.3'

/**
 * Fake connectionObj for testing
 */
const FakeConnectionConstructor = constructor(ConnectionObj)
const _FakeConnectionManagerConstructor = FakeConnectionManagerConstructor
export { _FakeConnectionManagerConstructor as FakeConnectionManagerConstructor }
const _fakeConnectionMgr = fakeConnectionMgr
export { _fakeConnectionMgr as fakeConnectionMgr }
const _FakeSocketConstructor = FakeSocketConstructor
export { _FakeSocketConstructor as FakeSocketConstructor }
const _fakeSocket = fakeSocket
export { _fakeSocket as fakeSocket }
const _FakeConnectionConstructor = FakeConnectionConstructor
export { _FakeConnectionConstructor as FakeConnectionConstructor }
