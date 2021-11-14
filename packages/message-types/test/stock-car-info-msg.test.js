// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const t = require("tap");
const { StockCarInfoMessage } = require("../src/stockCarInfoMessage.js");

const stockCarInfoMessage1 = new StockCarInfoMessage(1, 0, 0);

t.test("StockCarInfoMsg", (t) => {
  const {
    msgNo,
    starterCash,
    dealerId,
    brand,
    noCars,
    moreToCome,
    StockCarList,
  } = stockCarInfoMessage1;
  t.equal(msgNo, 141);
  t.equal(starterCash, 1);
  t.equal(dealerId, 0);
  t.equal(brand, 0);
  t.equal(noCars, 1);
  t.equal(moreToCome, 0);
  t.same(StockCarList, []);
  t.end();
});
