// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from "@jest/globals";
import { LoginMessage } from "../src/index";

const inboundBuffer = Buffer.alloc(42);
inboundBuffer.write("NotAPerson", 24);
inboundBuffer.write("0.0.0.0", 34);
const loginMessage1 = new LoginMessage(inboundBuffer);

it("LoginMsg", () => {
  const {
    appId,
    toFrom,
    msgNo,
    customerId,
    personaId,
    lotOwnerId,
    brandedPartId,
    skinId,
    personaName,
    version,
    data,
  } = loginMessage1;
  expect(appId).toEqual(0);

  expect(toFrom).toEqual(0);

  expect(msgNo).toEqual(0);

  expect(customerId).toEqual(0);

  expect(personaId).toEqual(0);

  expect(lotOwnerId).toEqual(0);

  expect(brandedPartId).toEqual(0);

  expect(skinId).toEqual(0);

  expect(personaName).toContain("NotAPerson");

  expect(version).toContain("0.0.0.0");

  expect(data).toEqual(inboundBuffer);
});
