// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCarInfoMsg } from '../src/services/MCServer/MCOTS/StockCarInfoMsg'
import { expect } from 'chai'

/* eslint-env mocha */

const stockCarInfoMsg1 = new StockCarInfoMsg(1, 0, 0)

it('StockCarInfoMsg', function () {
  const {
    msgNo,
    starterCash,
    dealerId,
    brand,
    noCars,
    moreToCome,
    StockCarList
  } = stockCarInfoMsg1
  expect(msgNo).equals(141)

  expect(starterCash).equals(1)

  expect(dealerId).equals(0)

  expect(brand).equals(0)

  expect(noCars).equals(1)

  expect(moreToCome).equals(0)

  expect(StockCarList).to.deep.equal([])
})
