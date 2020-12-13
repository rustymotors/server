// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:webServer')
const fs = require('fs')
const https = require('https')
const logger = require('../../shared/logger')

/**
 *
 */
class AuthLogin {
  /**
   *
   * @param {AppSettings} config
   */
  constructor (config) {
    this.config = config
    this.logger = logger.child({ service: 'mcoserver:AuthLogin' })
  }

  /**
   *
   * @global
   * @typedef {Object} sslOptionsObj
   * @property {sting} cert
   * @property {boolean} honorCipherOrder
   * @property {string} key
   * @property {boolean} rejectUnauthorized
   */

  /**
   *
   * @param {IServerConfiguration.serverConfig} configuration
   * @return {sslOptionsObj}
   * @memberof! WebServer
   */
  _sslOptions (configuration) {
    debug(`Reading ${configuration.certFilename}`)

    return {
      cert: fs.readFileSync(configuration.certFilename),
      honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false
    }
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket () {
    return 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e'
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetCert () {
    return fs.readFileSync(this.config.serverConfig.certFilename)
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey () {
    return fs.readFileSync(this.config.serverConfig.publicKeyFilename)
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry () {
    const dynamicRegistryFile = `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${this.config.serverConfig.ipServer}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${this.config.serverConfig.ipServer}"
"PatchServerPort"="80"
"CreateAccount"="${this.config.serverConfig.ipServer}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${this.config.serverConfig.ipServer}/ShardList/"
"ShardUrlDev"="http://${this.config.serverConfig.ipServer}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${this.config.serverConfig.ipServer}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`
    return dynamicRegistryFile
  }

  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @memberof! WebServer
   */
  // file deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  _httpsHandler (request, response) {
    this.logger.info(
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    )
    if (request.url.startsWith('/AuthLogin')) {
      response.setHeader('Content-Type', 'text/plain')
      return response.end(this._handleGetTicket())
    }

    if (request.url === '/cert') {
      response.setHeader('Content-disposition', 'attachment; filename=cert.pem')
      return response.end(this._handleGetCert())
    }

    if (request.url === '/key') {
      response.setHeader('Content-disposition', 'attachment; filename=pub.key')
      return response.end(this._handleGetKey())
    }

    if (request.url === '/registry') {
      response.setHeader('Content-disposition', 'attachment; filename=mco.reg')
      return response.end(this._handleGetRegistry())
    }

    if (request.url === '/') {
      return response.end('Hello, world!')
    }

    return response.end('Unknown request.')
  }

  /**
   *
   * @memberof! WebServer
   */
  async start () {
    await https
      .createServer(this._sslOptions(this.config.serverConfig), (req, res) => {
        this._httpsHandler(req, res)
      })
      .listen({ port: 443, host: '0.0.0.0' }, () => {
        debug('port 443 listening')
      })
  }
}

module.exports = {
  WebServer: AuthLogin
}
