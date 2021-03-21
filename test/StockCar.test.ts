// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCar } from '../src/services/MCServer/MCOTS/StockCar'
import { expect } from 'chai'

/* eslint-env mocha */

const stockCar1 = new StockCar(105, 20, 0)

it('StockCar', function () {
  const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1
  expect(brandedPartId).equals(105)

  expect(retailPrice).equals(20)

  expect(bIsDealOfTheDay).equals(0)
})
