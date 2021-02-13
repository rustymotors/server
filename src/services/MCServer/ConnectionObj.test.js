// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const sinon = require('sinon')
const { Socket } = require('net')
const depLogger = require('../../shared/logger')
const { DatabaseManager } = require('../../shared/DatabaseManager')
const {
  ConnectionObj
} = require('./ConnectionObj')
const {
  ConnectionMgr
} = require('./ConnectionMgr')
const tap = require('tap')

const fakeLogger = sinon.mock(depLogger.logger)
fakeLogger.expects('child').withArgs().atLeast(1)

const fakeDatabaseManager = sinon.createStubInstance(DatabaseManager)

const fakeConnectionManager = sinon.createStubInstance(ConnectionMgr)

tap.test('ConnectionObj', t => {
  const testConnection = new ConnectionObj(
    'abc',
    new Socket(),
    fakeDatabaseManager
  )

  t.equal(testConnection.status, 'INACTIVE')
  t.notOk(testConnection.isSetupComplete)
  testConnection.setEncryptionKey(Buffer.from('abc123', 'hex'))
  t.ok(testConnection.isSetupComplete)

  t.done()
})

tap.test('ConnectionObj cross-comms', t => {
  /** @type {ConnectionObj} */
  let testConn1
  /** @type {ConnectionObj} */
  let testConn2

  t.beforeEach((done, t1) => {
    testConn1 = new ConnectionObj('def', new Socket(), fakeConnectionManager)
    testConn2 = new ConnectionObj('ghi', new Socket(), fakeConnectionManager)
    testConn1.setEncryptionKey(Buffer.from('abc123', 'hex'))
    testConn2.setEncryptionKey(Buffer.from('abc123', 'hex'))
    done()
  })

  const plainText1 = Buffer.from(
    "I'm a very a secret message. Please don't decode me!"
  )
  const cipherText1 = Buffer.from([
    0x71,
    0xf2,
    0xae,
    0x29,
    0x91,
    0x8d,
    0xba,
    0x3d,
    0x5e,
    0x6c,
    0x31,
    0xb0,
    0x3a,
    0x58,
    0x82,
    0xa3,
    0xdd,
    0xb9,
    0xec,
    0x5d,
    0x3e,
    0x82,
    0xd4,
    0x4f,
    0xc0,
    0xe5,
    0xe5,
    0x39,
    0x03,
    0xba,
    0x1c,
    0x19,
    0xc4,
    0x16,
    0x03,
    0x68,
    0xff,
    0xc9,
    0x6f,
    0x72,
    0xe4,
    0x94,
    0x27,
    0x40,
    0x46,
    0x47,
    0x56,
    0xf0,
    0x79,
    0x70,
    0xbf,
    0x45
  ])

  t.test('Connection one is not the same id as connection two', t1 => {
    t1.notEqual(testConn1.enc.getId(), testConn2.enc.getId())
    t1.done()
  })

  t.test('Connection Two can decipher Connection One', t1 => {
    t1.ok(testConn1.enc)
    const encipheredBuffer = testConn1.enc.encrypt(plainText1)
    t1.deepEqual(encipheredBuffer, cipherText1)
    t1.ok(testConn2.enc)
    t1.deepEqual(testConn1.enc.decrypt(encipheredBuffer), plainText1)
    t1.deepEqual(testConn2.enc.decrypt(encipheredBuffer), plainText1)

    // Try again
    const encipheredBuffer2 = testConn1.enc.encrypt(plainText1)
    t1.deepEqual(testConn1.enc.decrypt(encipheredBuffer2), plainText1)
    t1.deepEqual(testConn2.enc.decrypt(encipheredBuffer2), plainText1)

    // And again
    const encipheredBuffer3 = testConn1.enc.encrypt(plainText1)
    t1.deepEqual(testConn1.enc.decrypt(encipheredBuffer3), plainText1)
    t1.deepEqual(testConn2.enc.decrypt(encipheredBuffer3), plainText1)
    t1.done()
  })
  t.done()
})
