// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')

const IServerConfiguration = {
  serverConfig: {
    ipServer: '',
    certFilename: '',
    publicKeyFilename: '',
    privateKeyFilename: '',
    registryFilename: ''
  }
}

/**
 *
 */
class ConfigManager {
  constructor () {
    this.config = JSON.parse(
      fs.readFileSync('src/services/AuthLogin/config.json', 'utf8')
    )
  }

  /**
   *
   * @return {IServerConfiguration}
   */
  getConfig () {
    return this.config
  }
}

module.exports = {
  IServerConfiguration,
  ConfigManager
}
