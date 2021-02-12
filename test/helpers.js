// @ts-nocheck
// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const td = require('testdouble')
const { logger } = require('../src/shared/logger')
const { ConnectionMgr } = require('../src/services/MCServer/ConnectionMgr')
const { DatabaseManager } = require('../src/shared/databaseManager')
const net = require('net')
const { ConnectionObj } = require('../src/services/MCServer/ConnectionObj')

exports.deepCopyFunction = deepCopyFunction = inObject => {
  let outObject, value, key

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (let key in inObject) {
    if (inObject[key]) {
      value = inObject[key]

      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopyFunction(value)
    }
  }

  return outObject
}

exports.fakeConfig = {
  serverConfig: {
    certFilename: '/cert/cert.pem',
    privateKeyFilename: '/cert/private.key',
    ipServer: '',
    publicKeyFilename: '',
    connectionURL: ''
  }
}

const fakeLogger = td.object(logger)
exports.fakeLogger = fakeLogger
exports.fakeLogger.child = function() {
  return exports.fakeLogger
}

exports.fakeDatabaseManagerConstructor = td.constructor(DatabaseManager)
exports.fakeDatabaseManager = new exports.fakeDatabaseManagerConstructor(exports.fakeLogger)

exports.fakeConnectionManagerConstructor = td.constructor(ConnectionMgr)
exports.fakeConnectionMgr = new exports.fakeConnectionManagerConstructor(exports.fakeLogger, exports.fakeDatabaseManager)

/**
 * Fake socket for testing
 */
exports.fakeSocketConstructor = td.constructor(net.Socket)
const fakeSocket = new exports.fakeSocketConstructor()
fakeSocket.localPort = '7003'
exports.fakeSocket = fakeSocket

/**
 * Fake connectionObj for testing
 */
exports.fakeConnectionConstructor = td.constructor(ConnectionObj)