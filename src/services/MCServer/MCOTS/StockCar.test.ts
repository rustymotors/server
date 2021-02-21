// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCar } from './StockCar'
import tap from 'tap'

const stockCar1 = new StockCar(105, 20, 0)

tap.test('StockCar', t => {
  const { brandedPartId, retailPrice, bIsDealOfTheDay } = stockCar1
  t.equal(brandedPartId, 105)

  t.equal(retailPrice, 20)

  t.equal(bIsDealOfTheDay, 0)
  t.done()
})
