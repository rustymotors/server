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

import MsgHead from "./MsgHead";

const msgHead1 = new MsgHead(Buffer.concat([Buffer.from([0x14, 0x00]), Buffer.from("TOMC")]));

describe("MsgHead", () => {
  test("length is correct", () => {
    expect(msgHead1.length).toBe(20);
  });
  test("mcosig is correct", () => {
    expect(msgHead1.mcosig).toBe("TOMC");
  });
});
