// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {expect, it} from '@jest/globals';
import {ListenerThread} from '../src/services/MCServer/listener-thread.js';
import {fakeConnectionMgr, fakeConfig, fakeSocket, FakeConnectionConstructor} from './helpers.js';

it('ListenerThread', async () => {
  const listenerThread = new ListenerThread(fakeConfig);

  const server = await listenerThread.startTCPListener(3000, fakeConnectionMgr);

  listenerThread._listener(fakeSocket, fakeConnectionMgr);
  server.close();
});

it('ListenerThread - _onData', async () => {
  const listenerThread = new ListenerThread(fakeConfig);

  const fakeConnection1 = new FakeConnectionConstructor('test_connction_1', fakeSocket, fakeConnectionMgr);
  fakeConnection1.remoteAddress = '0.0.0.0';

  expect(fakeConnection1.remoteAddress).toEqual('0.0.0.0');

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1);
  } catch (error) {
    expect(error.message).not.toEqual('Remote address is empty');
  }

  const fakeConnection3 = new FakeConnectionConstructor('test_connction_3', fakeSocket, fakeConnectionMgr);
  fakeConnection3.sock = fakeSocket;
  fakeConnection3.mgr = fakeConnectionMgr;
  fakeConnection3.remoteAddress = undefined;

  expect(fakeConnection3.remoteAddress).toEqual(undefined);

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3);
  } catch (error) {
    expect(error.message).toContain('Remote address is empty');
  }
});
