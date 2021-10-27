// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, test } from "@jest/globals";
import { StockCar } from "../src/index";

const stockCar1 = new StockCar(105, 20, 0);

test("StockCar", () => {
  const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1;
  expect(brandedPartId).toEqual(105);

  expect(retailPrice).toEqual(20);

  expect(bIsDealOfTheDay).toEqual(0);
});
