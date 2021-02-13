// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const mock = require('mock-fs')
const { WebServer } = require('./AuthLogin')
const tap = require('tap')
const { fakeConfig } = require('../../../test/helpers')

tap.test('WebServer', t => {
  const webServer = new WebServer(fakeConfig)

  t.test('_sslOptions()', async t1 => {
    const config = {
      certFilename: '/cert/cert.pem',
      privateKeyFilename: '/cert/private.key'
    }

    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/': {}
    })
    try {
      await webServer._sslOptions(config)
    } catch (error) {
      t1.contains(error, /cert.pem/, 'throws when cert file is not found')
    }
    mock.restore()
    //  deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff'
    })
    try {
      await webServer._sslOptions(config)
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
      await webServer._sslOptions(config)
    } catch (error) {
      t1.contains(error, /private.key/, 'throws when key file is not found')
    }
    mock.restore()
    t1.done()
  })
  t.done()
})
