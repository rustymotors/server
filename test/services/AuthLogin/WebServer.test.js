// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { WebServer } = require('../../../src/services/AuthLogin/src/WebServer')
const fs = require('fs')
const tap = require('tap')

tap.test('WebServer', (t) => {
  const webServer = new WebServer()
  const staticRegistry = fs.readFileSync(
    webServer.config.serverConfig.registryFilename
  )
  const dynamicRegistry = webServer._handleGetRegistry()
  t.equal(dynamicRegistry, staticRegistry.toString('utf-8'))
  t.done()
})
