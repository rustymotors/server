// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { PersonaServer } = require('../../../src/services/MCServer/PersonaServer/PersonaServer')
const tap = require('tap')

tap.test('PersonaServer Methods', async (t) => {
  const personaServer = new PersonaServer()
  personaServer.logger.level('warn')
  const results = personaServer._getPersonasByCustomerId(5551212)
  t.equal(results.length, 2)
  const name = results[0].name.toString('utf8')
  t.contains(name, 'Dr Brown')

  const personas = await personaServer._npsGetPersonaMapsByCustomerId(
    5551212
  )
  const id1 = personas[0].id
  const name1 = personas[0].name
  t.equal(id1.readInt32BE(0), 8675309)
  t.equal(name1.toString('utf8').length, 30)

  t.done()
})
