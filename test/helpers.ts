// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from 'net'
import td from 'testdouble'
import { SessionManager } from '../src/services/MCServer/connection-mgr'
import { DatabaseManager } from '../src/services/shared/database-manager'
import { MCServer } from '../src/services/MCServer/index'
import { TCPConnection } from '../src/services/MCServer/tcpConnection'
import { IAppConfiguration } from '../config'
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
export const fakeSettings: IAppConfiguration = {
  certificate: {
    privateKeyFilename: '',
    publicKeyFilename: '',
    certFilename: '',
  },
  serverSettings: {
    ipServer: '',
  },
  serviceConnections: {
    databaseURL: '',
  },
  defaultLogLevel: '',
}

const FakeConnectionManagerConstructor = constructor(SessionManager)
export const fakeConnectionMgr = new FakeConnectionManagerConstructor(
  fakeDatabaseManager,
  fakeSettings,
)

/**
 * Fake socket for testing
 */
const FakeSocketConstructor = constructor(Socket)
export const fakeSocket = new FakeSocketConstructor()
// fakeSocket.localPort = '7003'
// fakeSocket.remoteAddress = '10.1.2.3'

/**
 * Fake connectionObj for testing
 */
export const FakeConnectionConstructor = constructor(TCPConnection)
