"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const stock_car_1 = require("../src/services/MCOTS/stock-car");
const stockCar1 = new stock_car_1.StockCar(105, 20, 0);
globals_1.test('StockCar', () => {
    const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1;
    globals_1.expect(brandedPartId).toEqual(105);
    globals_1.expect(retailPrice).toEqual(20);
    globals_1.expect(bIsDealOfTheDay).toEqual(0);
});
//# sourceMappingURL=stock-car.test.js.map