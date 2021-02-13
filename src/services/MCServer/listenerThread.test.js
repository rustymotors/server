// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const tap = require('tap')
const { fakeLogger, fakeConnectionMgr, fakeConfig, fakeSocket, FakeConnectionConstructor } = require('../../../test/helpers')
const {
  ListenerThread
} = require('./listenerThread')

tap.test('ListenerThread', async t => {
  const listenerThread = new ListenerThread(fakeConfig, fakeLogger.child({ service: 'mcoserver:TestListenerThread' }))

  const server = await listenerThread.startTCPListener(80, fakeConnectionMgr, fakeConfig.serverConfig)

  listenerThread._listener(fakeSocket, fakeConnectionMgr, fakeConfig.serverConfig)
  server.close()
  t.done()
})

tap.test('ListenerThread - _onData', async t => {
  const listenerThread = new ListenerThread(fakeConfig, fakeLogger.child({ service: 'mcoserver:TestListenerThread' }))

  const fakeConnection1 = new FakeConnectionConstructor('test_connction_1', fakeSocket, fakeConnectionMgr)
  fakeConnection1.remoteAddress = '0.0.0.0'

  t.same(fakeConnection1.remoteAddress, '0.0.0.0', 'remoteAddress is 0.0.0.0')

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1, fakeConfig.serverConfig)
  } catch (err) {
    t.notOk(err.message.includes('Remote address is empty'), 'remoteAddress is empty')
  }

  const fakeConnection3 = new FakeConnectionConstructor('test_connction_3', fakeSocket, fakeConnectionMgr)
  fakeConnection3.sock = fakeSocket
  fakeConnection3.mgr = fakeConnectionMgr
  fakeConnection3.remoteAddress = undefined

  t.same(fakeConnection3.remoteAddress, undefined, 'remoteAddress is undefined')

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3, fakeConfig.serverConfig)
  } catch (err) {
    t.ok(err.message.includes('Remote address is empty'), 'remoteAddress is empty')
    t.done()
  }
})
