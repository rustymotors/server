// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {expect} from 'chai';
import {NPSPacketManager} from '../src/services/MCServer/npsPacketManager.js';
import {fakeDatabaseManager, fakeSettings} from './helpers.js';

/* eslint-env mocha */

describe('NPSPacketManager', () => {
	it('NPSPacketManger', async () => {
		const npsPacketManager = new NPSPacketManager(fakeDatabaseManager, fakeSettings);
		expect(npsPacketManager.msgCodetoName(0x2_29)).to.equal('NPS_MINI_USER_LIST');
	});
});
