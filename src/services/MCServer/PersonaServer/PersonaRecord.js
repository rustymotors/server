// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/**
 *
 * @global
 * @typedef {Object} IPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

 /** @type IPersonaRecord */
const PersonaRecord = {
  customerId: 0,
  id: Buffer.alloc(1),
  maxPersonas: Buffer.alloc(1),
  name: Buffer.alloc(1),
  personaCount: Buffer.alloc(1),
  shardId: Buffer.alloc(1)
}

module.exports = {
  PersonaRecord
}
