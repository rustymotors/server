// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCar } from "../../src/messageTypes/StockCar";

const stockCar1 = new StockCar();

describe("StockCar", () => {
  const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1;
  test("brandedPartId is correct", () => {
    expect(brandedPartId).toBe(105);
  });
  test("retailPrice is correct", () => {
    expect(retailPrice).toBe(20);
  });
  test("bIsDealOfTheDay is correct", () => {
    expect(bIsDealOfTheDay).toBe(0);
  });
});
