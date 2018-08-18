// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const { GetLobbiesListMsg } = require('./GetLobbiesListMsg');

const getLobbiesListMsg1 = new GetLobbiesListMsg(Buffer.concat([Buffer.from([0x44, 0x01]), Buffer.from('TOMC'), Buffer.alloc(12)]));

describe('GetLobbiesListMsgMsg', () => {
  test('msgNo is correct', () => {
    expect(getLobbiesListMsg1.msgNo).toBe(324);
  });
});
