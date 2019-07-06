// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCarInfoMsg } from "./StockCarInfoMsg";

const stockCarInfoMsg1 = new StockCarInfoMsg();

describe("StockCarInfoMsg", () => {
  const {
    msgNo,
    starterCash,
    dealerId,
    brand,
    noCars,
    moreToCome,
    StockCarList,
  } = stockCarInfoMsg1;
  test("msgNo is correct", () => {
    expect(msgNo).toBe(141);
  });
  test("starterCash is correct", () => {
    expect(starterCash).toBe(1);
  });
  test("dealerId is correct", () => {
    expect(dealerId).toBe(0);
  });
  test("brand is correct", () => {
    expect(brand).toBe(0);
  });
  test("noCars is correct", () => {
    expect(noCars).toBe(1);
  });
  test("moreToCome is correct", () => {
    expect(moreToCome).toBe(0);
  });
  test("stockCarList is correct", () => {
    expect(StockCarList).toEqual([]);
  });
});
