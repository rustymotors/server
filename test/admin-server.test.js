// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {expect, describe, it} from '@jest/globals';
import mock, {restore} from 'mock-fs';
import {AdminServer} from '../src/services/AdminServer/index.js';
import {fakeConfig, fakeMCServer} from './helpers.js';

const adminServer = new AdminServer(fakeMCServer);

describe('AdminServer', () => {
  it('_sslOptions()', async () => {
    //  Deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/': {},
    });
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig);
    } catch (error) {
      expect(error).toMatch(/cert.pem/);
    }

    restore();
    //  Deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff',
    });
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig);
    } catch (error) {
      expect(error).toMatch(/private.key/);
    }

    restore();
    //  Deepcode ignore WrongNumberOfArgs/test: false positive
    mock({
      '/cert/cert.pem': 'stuff',
      '/cert/private.key': 'stuff',
    });
    try {
      await adminServer._sslOptions(fakeConfig.serverConfig);
    } catch (error) {
      expect(error).toMatch(/private.key/);
    }

    restore();
  });
});
