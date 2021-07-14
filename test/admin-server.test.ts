// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, test } from '@jest/globals'
import { AdminServer } from '../src/services/AdminServer/index'
import { fakeMCServer } from './helpers'

test('AdminServer', () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = new AdminServer(fakeMCServer)
    expect(true).toBeTruthy()
  } catch (error) {
    expect(error).toBeFalsy()
  }
})
