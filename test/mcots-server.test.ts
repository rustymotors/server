// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { describe, expect, test } from '@jest/globals'
import { MCOTServer } from '../src/services/MCOTS/mcots-server'

const mcotServer = new MCOTServer()

describe('MCOTS Server', () => {
  test('msg_string()', () => {
    expect(mcotServer._MSG_STRING(438)).toEqual('MC_CLIENT_CONNECT_MSG')
  })

  test('msg_string()', () => {
    expect(mcotServer._MSG_STRING(105)).toEqual('MC_LOGIN')
  })

  test('msg_string()', () => {
    expect(mcotServer._MSG_STRING(106)).toEqual('MC_LOGOUT')
  })

  test('msg_string()', () => {
    expect(mcotServer._MSG_STRING(109)).toEqual('MC_SET_OPTIONS')
  })

  test('msg_string()', () => {
    expect(mcotServer._MSG_STRING(141)).toEqual('MC_STOCK_CAR_INFO')
  })
})
