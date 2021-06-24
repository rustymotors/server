// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const td = require('testdouble')
const { ConnectionMgr } = require('../src/services/MCServer/ConnectionMgr')
const { DatabaseManager } = require('../src/shared/DatabaseManager')
const net = require('net')
const { ConnectionObj } = require('../src/services/MCServer/ConnectionObj')

/**
 * @type {IAppSettings}
 */
const fakeSettings = {

}
module.exports.fakeSettings = fakeSettings

const FakeDatabaseManagerConstructor = td.constructor(DatabaseManager)
const fakeDatabaseManager = new FakeDatabaseManagerConstructor()

const FakeConnectionManagerConstructor = td.constructor(ConnectionMgr)
const fakeConnectionMgr = new FakeConnectionManagerConstructor(fakeDatabaseManager, fakeSettings)

/**
 * Fake socket for testing
 */
const FakeSocketConstructor = td.constructor(net.Socket)
const fakeSocket = new FakeSocketConstructor()
fakeSocket.localPort = '7003'
fakeSocket.remoteAddress = '3.3.3.3'

/**
 * Fake connectionObj for testing
 */
const FakeConnectionConstructor = td.constructor(ConnectionObj)
module.exports.FakeConnectionManagerConstructor = FakeConnectionManagerConstructor
module.exports.fakeConnectionMgr = fakeConnectionMgr
module.exports.FakeSocketConstructor = FakeSocketConstructor
module.exports.fakeSocket = fakeSocket
module.exports.FakeConnectionConstructor = FakeConnectionConstructor
