// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../src/services/shared/logger";
import { LoginServer } from "../src/LoginServer/LoginServer";

const loginServer = new LoginServer(new Logger().getLoggers());

test("retuns a valid customer id - d316cd2dd6bf870893dfbaaf17f965884e", () => {
  const { customerId, userId } = loginServer._npsGetCustomerIdByContextId(
    "d316cd2dd6bf870893dfbaaf17f965884e"
  );
  expect(customerId.readUInt32BE(0).toString()).toEqual("5551212");
});

test("retuns a valid user id - d316cd2dd6bf870893dfbaaf17f965884e", () => {
  const { customerId, userId } = loginServer._npsGetCustomerIdByContextId(
    "d316cd2dd6bf870893dfbaaf17f965884e"
  );
  expect(userId.readUInt32BE(0).toString()).toEqual("1");
});

test("retuns a valid customer id - 5213dee3a6bcdb133373b2d4f3b9962758", () => {
  const { customerId, userId } = loginServer._npsGetCustomerIdByContextId(
    "5213dee3a6bcdb133373b2d4f3b9962758"
  );
  expect(customerId.readUInt32BE(0).toString()).toEqual("2885746688");
});

test("retuns a valid user id - 5213dee3a6bcdb133373b2d4f3b9962758", () => {
  const { customerId, userId } = loginServer._npsGetCustomerIdByContextId(
    "5213dee3a6bcdb133373b2d4f3b9962758"
  );
  expect(userId.readUInt32BE(0).toString()).toEqual("2");
});
