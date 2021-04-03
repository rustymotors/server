// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const mock = require('mock-fs')
const { AuthLogin } = require('../src/services/AuthLogin/AuthLogin')
const { fakeConfig } = require('./helpers')
const { IServerConfig } = require('../src/types') // lgtm [js/unused-local-variable]
const { expect } = require('chai')

/* eslint-env mocha */

describe('WebServer', () => {
  const webServer = new AuthLogin(fakeConfig)

  it('_sslOptions()', async () => {
    /**
     * @type {IServerConfig}
     */
    const config = {
      certFilename: '/cert/cert.pem',
      privateKeyFilename: '/cert/private.key',
      ipServer: '',
      publicKeyFilename: '',
      connectionURL: ''
    }

    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/': {}
    })
    try {
      await webServer._sslOptions(config)
    } catch (error) {
      expect(error).contains(/cert.pem/)
    }
    mock.restore()
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff'
    })
    try {
      await webServer._sslOptions(config)
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
      await webServer._sslOptions(config)
    } catch (error) {
      expect(error).contains(/private.key/)
    }
    mock.restore()
  })
})
