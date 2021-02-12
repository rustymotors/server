// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
const mock = require('mock-fs')
const { AdminServer } = require('../../../src/services/AdminServer/AdminServer')
const tap = require('tap')
const sinon = require('sinon')
const {logger} = require('../../../src/shared/logger')
const { MCServer: IMCServer, MCServer } = require('../../../src/services/MCServer')
const { DatabaseManager: IDatabaseManager, DatabaseManager } = require('../../../src/shared/databaseManager')
const td = require('testdouble')

const fakeConfig = {
  serverConfig: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    ipServer: '',
    publicKeyFilename: '',
    connectionURL: ''
  }
}

const fakeLogger = td.object(logger)

const fakeDatabaseManagerConstructor = td.constructor(DatabaseManager)
const fakeDatabaseManager = new fakeDatabaseManagerConstructor(fakeLogger)

const fakeMCServerConstructor = td.constructor(MCServer)
const fakeMCServer = new fakeMCServerConstructor(fakeConfig, fakeDatabaseManager)

const adminServer = new AdminServer(fakeMCServer)

tap.test('AdminServer', async t => {

  t.test('_sslOptions()', async t1 => {

    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/': {}
    })
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig)
    } catch (error) {
      t1.contains(error, /cert.pem/, 'throws when cert file is not found')
    }
    mock.restore()
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff'
    })
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig)
    } catch (error) {
      t1.contains(error, /private.key/, 'throws when key file is not found')
    }
    mock.restore()
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff',
      '/cert/private.key': 'stuff'
    })
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig)
    } catch (error) {
      t1.contains(error, /private.key/, 'throws when key file is not found')
    }
    mock.restore()
    t1.done()
  })

  t.done()
})
