// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, test } from '@jest/globals'
import { StockCarInfoMessage } from '../src/services/MCOTS/stock-car-info-msg'

const stockCarInfoMessage1 = new StockCarInfoMessage(1, 0, 0)

test('StockCarInfoMsg', () => {
  const {
    msgNo,
    starterCash,
    dealerId,
    brand,
    noCars,
    moreToCome,
    StockCarList,
  } = stockCarInfoMessage1
  expect(msgNo).toEqual(141)

  expect(starterCash).toEqual(1)

  expect(dealerId).toEqual(0)

  expect(brand).toEqual(0)

  expect(noCars).toEqual(1)

  expect(moreToCome).toEqual(0)

  expect(StockCarList).toStrictEqual([])
})
