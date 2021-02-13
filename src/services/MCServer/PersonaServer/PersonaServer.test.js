// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  PersonaServer
} = require('./PersonaServer')
const tap = require('tap')
const { NPSMsg } = require('../MCOTS/NPSMsg')

const fakeLogger = {
  info: function () {},
  warn: function () {},
  error: function () {}
}

tap.test('PersonaServer Methods', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const results = personaServer._getPersonasByCustomerId(5551212)
  t.equal(results.length, 2)
  const name = results[0].name.toString('utf8')
  t.contains(name, 'Dr Brown')

  const personas = await personaServer._npsGetPersonaMapsByCustomerId(5551212)
  const id1 = personas[0].id
  const name1 = personas[0].name
  t.equal(id1.readInt32BE(0), 8675309)
  t.equal(name1.toString('utf8').length, 30)

  const badPersonas = await personaServer._getPersonasByCustomerId(123654)

  t.equals(badPersonas.length, 0, 'no personas found')

  t.done()
})

tap.test('PersonaServer _npsSelectGamePersona()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved').serialize()
  const results = await personaServer._npsSelectGamePersona(data)
  t.equal(results.direction, 'Sent')
  t.done()
})

tap.test('PersonaServer _npsNewGameAccount()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved').serialize()
  const results = await personaServer._npsNewGameAccount(data)
  t.equal(results.direction, 'Sent')
  t.done()
})

tap.test('PersonaServer _npsLogoutGameUser()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved').serialize()
  const results = await personaServer._npsLogoutGameUser(data)
  t.equal(results.direction, 'Sent')
  t.done()
})

tap.test('PersonaServer _npsCheckToken()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved').serialize()
  const results = await personaServer._npsCheckToken(data)
  t.equal(results.direction, 'Sent')
  t.done()
})

tap.test('PersonaServer _npsValidatePersonaName()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved').serialize()
  const results = await personaServer._npsValidatePersonaName(data)
  t.equal(results.direction, 'Sent')
  t.done()
})

tap.test('PersonaServer _send()', async t => {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg('Recieved')
  const fakeSocket = {}
  await personaServer._send(fakeSocket, data)
  t.done()
})

tap.test('PersonaServer _npsGetPersonaMapsByCustomerId()', async t => {
  const personaServer = new PersonaServer(fakeLogger)

  const personas1 = await personaServer._npsGetPersonaMapsByCustomerId(
    2868969472
  )

  t.equals(personas1.length, 1)
  t.match(personas1[0].name.toString('utf8'), 'Doc Joe')

  const personas2 = await personaServer._npsGetPersonaMapsByCustomerId(4)

  t.equals(personas2.length, 0)

  t.done()
})
