// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { expect } = require('chai')
const { Socket } = require('net')
const sinon = require('sinon')
const { ConnectionMgr } = require('../src/services/MCServer/ConnectionMgr')
const { ConnectionObj } = require('../src/services/MCServer/ConnectionObj')
const logger = require('../src/services/@drazisil/mco-logger')

/* eslint-env mocha */

const fakeLogger = sinon.mock(logger)
fakeLogger.expects('log').withArgs().atLeast(1)

// TODO: REplace with testdouble
const fakeConnectionManager = sinon.createStubInstance(ConnectionMgr)

it('ConnectionObj', () => {
  const testConnection = new ConnectionObj(
    'abc',
    new Socket(),
    fakeConnectionManager
  )

  expect(testConnection.status).equals('Inactive')
  expect(testConnection.isSetupComplete).is.false
  testConnection.setEncryptionKey(Buffer.from('abc123', 'hex'))
  expect(testConnection.isSetupComplete).is.true
})

it('ConnectionObj cross-comms', () => {
  /** @type {ConnectionObj} */
  let testConn1
  /** @type {ConnectionObj} */
  let testConn2

  beforeEach(() => {
    testConn1 = new ConnectionObj('def', new Socket(), fakeConnectionManager)
    testConn2 = new ConnectionObj('ghi', new Socket(), fakeConnectionManager)
    testConn1.setEncryptionKey(Buffer.from('abc123', 'hex'))
    testConn2.setEncryptionKey(Buffer.from('abc123', 'hex'))
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

  it('Connection one is not the same id as connection two', () => {
    expect(testConn1.enc.getId()).is.not.equal(testConn2.enc.getId())
  })

  it('Connection Two can decipher Connection One', () => {
    expect(testConn1.enc).is.not.null
    const encipheredBuffer = testConn1.enc.encrypt(plainText1)
    expect(encipheredBuffer).to.deep.equal(cipherText1)
    expect(testConn2.enc).is.not.null
    expect(testConn1.enc.decrypt(encipheredBuffer)).deep.equals(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer)).deep.equals(plainText1)

    // Try again
    const encipheredBuffer2 = testConn1.enc.encrypt(plainText1)
    expect(testConn1.enc.decrypt(encipheredBuffer2)).deep.equals(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer2)).deep.equals(plainText1)

    // And again
    const encipheredBuffer3 = testConn1.enc.encrypt(plainText1)
    expect(testConn1.enc.decrypt(encipheredBuffer3)).deep.equals(plainText1)
    expect(testConn2.enc.decrypt(encipheredBuffer3)).deep.equals(plainText1)
  })
})
