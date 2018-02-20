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

import * as packet from '../packet';

test('retuns a buffer packet from premadeLogin', () => {
  expect(packet.premadeLogin()).toBeInstanceOf(Buffer);
});

test('retuns a buffer packet from craftGenericReply', () => {
  expect(packet.craftGenericReply()).toBeInstanceOf(Buffer);
});

test('retuns a buffer packet from premadePersonaMaps', () => {
  expect(packet.premadePersonaMaps()).toBeInstanceOf(Buffer);
});

test('retuns a buffer packet from buildPacket', () => {
  expect(packet.buildPacket(6, 0x601, Buffer.from([0x06, 0x01]))).toBeInstanceOf(Buffer);
});
