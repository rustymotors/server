// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it, beforeEach, describe } from '@jest/globals'
import { Socket } from 'net'
import { NPSMessage } from 'transactions'
import { PersonaServer } from './index.js'

const testSocket = new Socket()
testSocket.write = function () {
  return true
}

/** @type {PersonaServer} */
let personaServer

describe('Persona Server', () => {
  beforeEach(() => {
    personaServer = PersonaServer.getInstance()
  })

  it('PersonaServer Methods', async () => {
    const results = await personaServer.getPersonasByCustomerId(5_551_212)
    expect(results.length).toEqual(2)
    const name = results[0].name.toString('utf8')
    expect(name).toContain('Dr Brown')

    const personas = await personaServer.getPersonaMapsByCustomerId(5_551_212)
    const id1 = personas[0].id
    const name1 = personas[0].name
    expect(id1.readInt32BE(0)).toEqual(8_675_309)
    expect(name1.toString('utf8').length).toEqual(30)

    await expect(
      personaServer.getPersonasByCustomerId(123_654),
    ).rejects.toThrowError(/Unable to locate a persona/)
  })

  it('PersonaServer _npsSelectGamePersona()', async () => {
    const data = new NPSMessage('Sent').serialize()
    const results = await personaServer.handleSelectGamePersona(data)
    expect(results.direction).toEqual('Sent')
  })

  it('PersonaServer _npsNewGameAccount()', async () => {
    const data = new NPSMessage('Sent').serialize()
    const results = await personaServer.createNewGameAccount(data)
    expect(results.direction).toEqual('Sent')
  })

  it('PersonaServer _npsLogoutGameUser()', async () => {
    const data = new NPSMessage('Sent').serialize()
    const results = await personaServer.logoutGameUser(data)
    expect(results.direction).toEqual('Sent')
  })

  it('PersonaServer _npsCheckToken()', async () => {
    const data = new NPSMessage('Sent').serialize()
    const results = await personaServer.validateLicencePlate(data)
    expect(results.direction).toEqual('Sent')
  })

  it('PersonaServer _npsValidatePersonaName()', async () => {
    const data = new NPSMessage('Sent').serialize()
    const results = await personaServer.validatePersonaName(data)
    expect(results.direction).toEqual('Sent')
  })

  it('PersonaServer _send()', () => {
    const data = new NPSMessage('Sent')
    expect(() => {
      personaServer.sendPacket(testSocket, data)
    }).not.toThrow()
  })

  it('PersonaServer _npsGetPersonaMapsByCustomerId()', async () => {
    const personas1 = await personaServer.getPersonaMapsByCustomerId(
      2_868_969_472,
    )

    expect(personas1.length).toEqual(1)
    expect(personas1[0].name.toString('utf8')).toContain('Doc Joe')

    const personas2 = await personaServer.getPersonaMapsByCustomerId(4)

    expect(personas2.length).toEqual(0)
  })
})
