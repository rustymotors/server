// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import chai from 'chai';
const {expect} = chai;
import request from 'supertest';
import {CastanetResponse, PatchServer} from '../src/services/PatchAndShard/patchServer.js';

/* eslint-env mocha */

let patchServer;

describe('PatchServer', () => {
  beforeEach(() => {
    patchServer = new PatchServer();
  });

  it('PatchServer', () => {
    expect(CastanetResponse.body.toString('hex')).to.deep.equal('cafebeef00000000000003');
    expect(
      patchServer._patchUpdateInfo().body.toString('hex')).deep.equals(
      'cafebeef00000000000003',
    );
    expect(
      patchServer._patchNPS().body.toString('hex')).deep.equals(
      'cafebeef00000000000003',
    );
    expect(
      patchServer._patchMCO().body.toString('hex')).deep.equals(
      'cafebeef00000000000003',
    );
    expect(patchServer._generateShardList()).contains('The Clocktower');
    expect(patchServer._getBans()).deep.equals([]);
  });

  it('PatchServer - Shardlist', () => {
    request(patchServer.serverPatch)
      .get('/ShardList/')
      .then(
        response => {
          expect(response.text).contains('[The Clocktower]');
        },
        error => {
          console.error(`Error: ${error}`);
        },
      );
  });

  it('PatchServer - UpdateInfo', () => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/UpdateInfo')
      .then(response => {
        expect(response.body).deep.equals(CastanetResponse.body);
      })
      .catch(error => {
        console.error(error);
      });
  });

  it('PatchServer - NPS', () => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/NPS')
      .then(response => {
        expect(response.body).deep.equals(CastanetResponse.body);
      })
      .catch(error => {
        console.error(error);
      });
  });

  it('PatchServer - MCO', done => {
    request(patchServer.serverPatch)
      .get('/games/EA_Seattle/MotorCity/MCO')
      .then(response => {
        expect(response.body).deep.equals(CastanetResponse.body);
        done();
      })
      .catch(error => {
        console.error(error);
      });
  });

  it('PatchServer - Default', () => {
    expect(patchServer._getBans()).deep.equals([]);

    // Deepcode ignore PromiseNotCaughtNode/test: This promise doesn't return an error, it seems.
    request(patchServer.serverPatch)
      .get('/')
      .then(/** @type {request.Response} */ response => {
        expect(patchServer._getBans()).deep.equals([]);
        expect(response.status).equals(404);
      });
    patchServer._addBan('255.255.255.255');
    expect(
      patchServer._getBans()).deep.equals(
      ['255.255.255.255']);
    patchServer._clearBans();
    expect(
      patchServer._getBans()).deep.equals(
      []);
  });
});

