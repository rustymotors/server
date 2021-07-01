// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { PersonaServer } from '../src/services/PersonaServer/persona-server.js'
import { NPSMsg } from '../src/services/MCOTS/nps-msg.js'
import { fakeSocket } from './helpers.js'

it('PersonaServer Methods', async () => {
  const personaServer = new PersonaServer()
  const results = await personaServer._getPersonasByCustomerId(5_551_212)
  expect(results.length).toEqual(2)
  const name = results[0].name.toString('utf8')
  expect(name).toContain('Dr Brown')

  const personas = await personaServer._npsGetPersonaMapsByCustomerId(5_551_212)
  const id1 = personas[0].id
  const name1 = personas[0].name
  expect(id1.readInt32BE(0)).toEqual(8_675_309)
  expect(name1.toString('utf8').length).toEqual(30)

  await expect(
    personaServer._getPersonasByCustomerId(123_654),
  ).rejects.toThrowError(/Unable to locate a persona/)
})

it('PersonaServer _npsSelectGamePersona()', async () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT').serialize()
  const results = await personaServer._npsSelectGamePersona(data)
  expect(results.direction).toEqual('SENT')
})

it('PersonaServer _npsNewGameAccount()', async () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT').serialize()
  const results = await personaServer._npsNewGameAccount(data)
  expect(results.direction).toEqual('SENT')
})

it('PersonaServer _npsLogoutGameUser()', async () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT').serialize()
  const results = await personaServer._npsLogoutGameUser(data)
  expect(results.direction).toEqual('SENT')
})

it('PersonaServer _npsCheckToken()', async () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT').serialize()
  const results = await personaServer._npsCheckToken(data)
  expect(results.direction).toEqual('SENT')
})

it('PersonaServer _npsValidatePersonaName()', async () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT').serialize()
  const results = await personaServer._npsValidatePersonaName(data)
  expect(results.direction).toEqual('SENT')
})

it('PersonaServer _send()', () => {
  const personaServer = new PersonaServer()
  const data = new NPSMsg('SENT')
  expect(() => {
    personaServer._send(fakeSocket, data)
  }).not.toThrow()
})

it('PersonaServer _npsGetPersonaMapsByCustomerId()', async () => {
  const personaServer = new PersonaServer()

  const personas1 = await personaServer._npsGetPersonaMapsByCustomerId(
    2_868_969_472,
  )

  expect(personas1.length).toEqual(1)
  expect(personas1[0].name.toString('utf8')).toContain('Doc Joe')

  const personas2 = await personaServer._npsGetPersonaMapsByCustomerId(4)

  expect(personas2.length).toEqual(0)
})
