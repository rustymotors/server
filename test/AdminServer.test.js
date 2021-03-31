// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { expect } = require('chai')
const mock  = require('mock-fs')
const { AdminServer }  = require('../src/services/AdminServer/AdminServer')
const { fakeConfig, fakeMCServer }  = require('./helpers')

/* eslint-env mocha */

const adminServer = new AdminServer(fakeMCServer)

describe('AdminServer', async () => {
  it('_sslOptions()', async () => {
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/': {}
    })
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig)
    } catch (error) {
      expect(error).contains(/cert.pem/)
    }
    mock.restore()
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff'
    })
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig)
    } catch (error) {
      expect(error).contains(/private.key/)
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
      expect(error).contains(/private.key/)
    }
    mock.restore()
  })
})
