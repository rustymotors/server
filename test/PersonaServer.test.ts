// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PersonaServer } from '../src/services/MCServer/PersonaServer/PersonaServer'
import { NPSMsg } from '../src/services/MCServer/MCOTS/NPSMsg'
import { MESSAGE_DIRECTION } from '../src/services/MCServer/MCOTS/MessageNode'
import { fakeLogger, fakeSocket } from './helpers'
import { expect } from 'chai'

/* eslint-env mocha */

it('PersonaServer Methods', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const results = await personaServer._getPersonasByCustomerId(5551212)
  expect(results.length).equals(2)
  const name = results[0].name.toString('utf8')
  expect(name).contains('Dr Brown')

  const personas = await personaServer._npsGetPersonaMapsByCustomerId(5551212)
  const id1 = personas[0].id
  const name1 = personas[0].name
  expect(id1.readInt32BE(0)).equals(8675309)
  expect(name1.toString('utf8').length).equals(30)

  try {
    await personaServer._getPersonasByCustomerId(123654)
  } catch (error) {
    expect(error).contains(/Unable to locate a persona/)
  }

})

it('PersonaServer _npsSelectGamePersona()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT).serialize()
  const results = await personaServer._npsSelectGamePersona(data)
  expect(results.direction).equals(MESSAGE_DIRECTION.SENT)
})

it('PersonaServer _npsNewGameAccount()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT).serialize()
  const results = await personaServer._npsNewGameAccount(data)
  expect(results.direction).equals(MESSAGE_DIRECTION.SENT)
})

it('PersonaServer _npsLogoutGameUser()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT).serialize()
  const results = await personaServer._npsLogoutGameUser(data)
  expect(results.direction).equals(MESSAGE_DIRECTION.SENT)
})

it('PersonaServer _npsCheckToken()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT).serialize()
  const results = await personaServer._npsCheckToken(data)
  expect(results.direction).equals(MESSAGE_DIRECTION.SENT)
})

it('PersonaServer _npsValidatePersonaName()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT).serialize()
  const results = await personaServer._npsValidatePersonaName(data)
  expect(results.direction).equals(MESSAGE_DIRECTION.SENT)
})

it('PersonaServer _send()', async function () {
  const personaServer = new PersonaServer(fakeLogger)
  const data = new NPSMsg(MESSAGE_DIRECTION.SENT)
  await personaServer._send(fakeSocket, data)
})

it('PersonaServer _npsGetPersonaMapsByCustomerId()', async function () {
  const personaServer = new PersonaServer(fakeLogger)

  const personas1 = await personaServer._npsGetPersonaMapsByCustomerId(
    2868969472
  )

  expect(personas1.length).equals(1)
  expect(personas1[0].name.toString('utf8')).contains('Doc Joe')

  const personas2 = await personaServer._npsGetPersonaMapsByCustomerId(4)

  expect(personas2.length).equals(0)

})
