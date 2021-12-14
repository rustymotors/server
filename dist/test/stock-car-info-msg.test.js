"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const stock_car_info_msg_1 = require("../src/services/MCOTS/stock-car-info-msg");
const stockCarInfoMessage1 = new stock_car_info_msg_1.StockCarInfoMessage(1, 0, 0);
globals_1.test('StockCarInfoMsg', () => {
    const { msgNo, starterCash, dealerId, brand, noCars, moreToCome, StockCarList, } = stockCarInfoMessage1;
    globals_1.expect(msgNo).toEqual(141);
    globals_1.expect(starterCash).toEqual(1);
    globals_1.expect(dealerId).toEqual(0);
    globals_1.expect(brand).toEqual(0);
    globals_1.expect(noCars).toEqual(1);
    globals_1.expect(moreToCome).toEqual(0);
    globals_1.expect(StockCarList).toStrictEqual([]);
});
//# sourceMappingURL=stock-car-info-msg.test.js.map