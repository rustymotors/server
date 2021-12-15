// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { StockCarInfoMessage } from "./index";

const stockCarInfoMessage1 = new StockCarInfoMessage(1, 0, 0);

test("StockCarInfoMsg", (t) => {
  const {
    msgNo,
    starterCash,
    dealerId,
    brand,
    noCars,
    moreToCome,
    StockCarList,
  } = stockCarInfoMessage1;
  t.is(msgNo, 141);
  t.is(starterCash, 1);
  t.is(dealerId, 0);
  t.is(brand, 0);
  t.is(noCars, 1);
  t.is(moreToCome, 0);
  t.deepEqual(StockCarList, []);
  
});
