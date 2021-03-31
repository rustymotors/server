// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')
const ini = require('ini')
const path = require('path')

/**
 * Reads the INI configuration file
 */

const config = ini.parse(fs.readFileSync(path.join(process.cwd(), 'config/app_settings.ini'), 'utf8'))

/** @type {IAppSettings} */
module.exports.appSettings = {
  serverConfig: {
    certFilename: path.join(process.cwd(), config.serverConfig.certFilename),
    ipServer: config.serverConfig.ipServer,
    privateKeyFilename: path.join(process.cwd(), config.serverConfig.privateKeyFilename),
    publicKeyFilename: path.join(process.cwd(), config.serverConfig.publicKeyFilename),
    connectionURL: config.serverConfig.connectionURL
  }
}
