// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { StockCar } from "./index";

const stockCar1 = new StockCar(105, 20, 0);

t.test("StockCar", (t) => {
  const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1;
  t.equal(brandedPartId, 105);

  t.equal(retailPrice, 20);

  t.equal(bIsDealOfTheDay, 0);
  t.end();
});
