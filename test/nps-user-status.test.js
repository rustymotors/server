// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import chai from 'chai';
const {expect} = chai;
import {NPSUserStatus} from '../src/services/LoginServer/nps-user-status.js';

/* eslint-env mocha */

it('NPSUserStatus', () => {
  const testPacket = Buffer.from([0x7B, 0x00]);
  const npsUserStatus = new NPSUserStatus(testPacket);
  expect(npsUserStatus.opCode).equals(123);
});
