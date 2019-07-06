// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { LoginMsg } from "../../src/services/shared/messageTypes/LoginMsg";

const inboundBuffer = Buffer.alloc(42);
inboundBuffer.write("NotAPerson", 24);
inboundBuffer.write("0.0.0.0", 34);
const loginMsg1 = new LoginMsg(inboundBuffer);

describe("LoginMsg", () => {
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
  } = loginMsg1;
  test("appId is correct", () => {
    expect(appId).toBe(0);
  });
  test("toFrom is correct", () => {
    expect(toFrom).toBe(0);
  });
  test("msgNo is correct", () => {
    expect(msgNo).toBe(0);
  });
  test("customerId is correct", () => {
    expect(customerId).toBe(0);
  });
  test("personaId is correct", () => {
    expect(personaId).toBe(0);
  });
  test("lotOwnerId is correct", () => {
    expect(lotOwnerId).toBe(0);
  });
  test("brandedPartId is correct", () => {
    expect(brandedPartId).toBe(0);
  });
  test("skinId is correct", () => {
    expect(skinId).toBe(0);
  });
  test("personaName is correct", () => {
    expect(personaName).toContain("NotAPerson");
  });
  test("version is correct", () => {
    expect(version).toContain("0.0.0.0");
  });
  test("data is correct", () => {
    expect(data).toEqual(inboundBuffer);
  });
});
