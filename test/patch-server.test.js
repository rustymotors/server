// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, describe, it, beforeEach } from '@jest/globals'
import request from 'supertest'
import {
  CastanetResponse,
  PatchServer,
} from '../src/services/PatchAndShard/patch-server.js'

let patchServer

describe('PatchServer', () => {
  beforeEach(() => {
    patchServer = new PatchServer()
  })

  it('PatchServer', () => {
    expect(CastanetResponse.body.toString('hex')).toStrictEqual(
      'cafebeef00000000000003',
    )
    expect(patchServer._patchUpdateInfo().body.toString('hex')).toStrictEqual(
      'cafebeef00000000000003',
    )
    expect(patchServer._patchNPS().body.toString('hex')).toStrictEqual(
      'cafebeef00000000000003',
    )
    expect(patchServer._patchMCO().body.toString('hex')).toStrictEqual(
      'cafebeef00000000000003',
    )
    expect(patchServer._generateShardList()).toContain('The Clocktower')
    expect(patchServer._getBans()).toStrictEqual([])
  })

  it('PatchServer - Shardlist', () => {
    request(patchServer.serverPatch)
      .get('/ShardList/')
      .then(
        response => {
          expect(response.text).toContain('[The Clocktower]')
        },
        error => {
          console.error(`Error: ${error}`)
        },
      )
  })

  it('PatchServer - UpdateInfo', () => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/UpdateInfo')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
      })
      .catch(error => {
        console.error(error)
      })
  })

  it('PatchServer - NPS', () => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/NPS')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
      })
      .catch(error => {
        console.error(error)
      })
  })

  it('PatchServer - MCO', done => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/MCO')
      .then(response => {
        expect(response.body).toStrictEqual(CastanetResponse.body)
        done()
      })
      .catch(error => {
        console.error(error)
      })
  })

  it('PatchServer - Default', () => {
    expect(patchServer._getBans()).toStrictEqual([])

    // Deepcode ignore PromiseNotCaughtNode/test: This promise doesn't return an error, it seems.
    request(patchServer.serverPatch)
      .get('/')
      .then(
        /** @type {request.Response} */ response => {
          expect(patchServer._getBans()).toStrictEqual([])
          expect(response.status).toEqual(404)
        },
      )
    patchServer._addBan('255.255.255.255')
    expect(patchServer._getBans()).toStrictEqual(['255.255.255.255'])
    patchServer._clearBans()
    expect(patchServer._getBans()).toStrictEqual([])
  })
})
