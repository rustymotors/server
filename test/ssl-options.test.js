// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {expect, describe, it, jest, beforeEach, afterEach} from '@jest/globals';
import fs from 'fs';
import {_sslOptions} from '../src/services/@drazisil/ssl-options.js';
import {fakeConfig} from './helpers.js';

describe('sslOptions()', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'statSync').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will throw an error when unable to locate the certificate', async () => {
    //  Deepcode ignore WrongNumberOfArgs/test: false positive
    await expect(_sslOptions(fakeConfig.certificate)).rejects.toThrowError(/cert.pem/);
  });
});
