// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const tap = require('tap')
const { deepCopyFunction } = require('../../helpers')
const {
  ListenerThread
} = require('../../../src/services/MCServer/listenerThread')
const sinon = require('sinon')
const net = require('net')
/**
 * Fake logger object for testing
 */

const fakeLogger = {
  child: () => {
    return fakeLogger
  },
  info: () => {},
  error: err => {
    return err
  }
}

/**
 * Fake connectionMgr for testing
 */
const fakeConnectionMgr = {
  findOrNewConnection: _socket => {
    return {
      localPort: 7003,
      inQueue: true
    }
  },
  _updateConnectionByAddressAndPort: _socket => {
    return {
      localPort: 7003,
      inQueue: true
    }
  },
  processData: _socket => {
    return {
      localPort: 7003,
      inQueue: true
    }
  }
}

/**
 * Fake event for testing
 */
const fakeEvent = {
  code: ''
}

/**
 * Fake socket for testing
 */
const fakeSocket = {
  localPort: 7003,
  remoteAddress: '0.0.0.0',
  on: (event, fakeCallback) => {
    if (event === 'data') {
      return _fakeEvent => {}
      //   return fakeCallback({}, fakeConnectionMgr, {})
    }
    if (event === 'error') {
      return fakeCallback(fakeEvent)
    }
    if (event === 'end') {
      return fakeCallback()
    }
  },
  write: _data => {}
}

/**
 * Fake connectionObj for testing
 */
const fakeConnection = {
  id: '',
  sock: fakeSocket,
  mgr: fakeConnectionMgr,
  remoteAddress: fakeSocket.remoteAddress
}

tap.test('ListenerThread', async t => {
  const fakeNet = sinon.stub(net, 'createServer').callsFake(() => {
    return {
      listen: async (_port, _host) => {}
    }
  })
  const listenerThread = new ListenerThread(fakeLogger)
  await listenerThread.startTCPListener(80, '0.0.0.0')

  listenerThread._listener(fakeSocket, fakeConnectionMgr, {})
  t.done()
})

tap.test('ListenerThread - _onData', async t => {
  const listenerThread = new ListenerThread(fakeLogger)

  const fakeConnection1 = deepCopyFunction(fakeConnection)

  t.same(fakeConnection1.remoteAddress, '0.0.0.0')

  try {
    await listenerThread._onData(fakeSocket, fakeConnectionq, {})
  } catch (err) {
    t.notOk(err.message.includes('Remote address is empty'))
  }

  const fakeConnection2 = deepCopyFunction(fakeConnection)

  try {
    delete fakeConnection2.mgr.processData
    await listenerThread._onData(fakeSocket, fakeConnection2, {})
  } catch (err) {
    t.ok(err.message.includes('processData is not a function'))
  }

  const fakeConnection3 = deepCopyFunction(fakeConnection)

  try {
    delete fakeConnection3.remoteAddress
    t.same(fakeConnection3.remoteAddress, undefined)
    await listenerThread._onData(fakeSocket, fakeConnection3, {})
  } catch (err) {
    t.ok(err.message.includes('Remote address is empty'))
  }

  t.done()
})
