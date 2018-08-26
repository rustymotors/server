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

const loginServer = require("./LoginServer");

test("retuns a valid customer id - d316cd2dd6bf870893dfbaaf17f965884e", () => {
  const { customerId, userId } = loginServer.npsGetCustomerIdByContextId(
    "d316cd2dd6bf870893dfbaaf17f965884e"
  );
  expect(customerId.readUInt32BE().toString()).toEqual("1");
  expect(userId.readUInt32BE().toString()).toEqual("1");
});

test("retuns a valid customer id - 5213dee3a6bcdb133373b2d4f3b9962758", () => {
  const { customerId, userId } = loginServer.npsGetCustomerIdByContextId(
    "5213dee3a6bcdb133373b2d4f3b9962758"
  );
  expect(customerId.readUInt32BE().toString()).toEqual("2885746688");
  expect(userId.readUInt32BE().toString()).toEqual("2");
});
