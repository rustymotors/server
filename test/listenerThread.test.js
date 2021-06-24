// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { fakeConnectionMgr, fakeConfig, fakeSocket, FakeConnectionConstructor } = require('./helpers')
const { ListenerThread } = require('../src/services/MCServer/listenerThread')
const { expect } = require('chai')

/* eslint-env mocha */

it('ListenerThread', async () => {
  const listenerThread = new ListenerThread(fakeConfig)

  const server = await listenerThread.startTCPListener(3000, fakeConnectionMgr)

  listenerThread._listener(fakeSocket, fakeConnectionMgr)
  server.close()
})

it('ListenerThread - _onData', async () => {
  const listenerThread = new ListenerThread(fakeConfig)

  const fakeConnection1 = new FakeConnectionConstructor('test_connction_1', fakeSocket, fakeConnectionMgr)
  fakeConnection1.remoteAddress = '0.0.0.0'

  expect(fakeConnection1.remoteAddress).equals('0.0.0.0')

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1)
  } catch (err) {
    expect(err.message).to.not.equal('Remote address is empty')
  }

  const fakeConnection3 = new FakeConnectionConstructor('test_connction_3', fakeSocket, fakeConnectionMgr)
  fakeConnection3.sock = fakeSocket
  fakeConnection3.mgr = fakeConnectionMgr
  fakeConnection3.remoteAddress = undefined

  expect(fakeConnection3.remoteAddress).equals(undefined)

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3)
  } catch (err) {
    expect(err.message).includes('Remote address is empty')
  }
})
