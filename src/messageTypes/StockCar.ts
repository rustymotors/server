// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

export class StockCar {
  public brandedPartId: number;
  public retailPrice: number;
  public bIsDealOfTheDay: number;

  constructor() {
    this.brandedPartId = 105;
    this.retailPrice = 20;
    this.bIsDealOfTheDay = 0;
  }

  public serialize() {
    const packet = Buffer.alloc(10);
    packet.writeInt32LE(this.brandedPartId, 0);
    packet.writeInt32LE(this.retailPrice, 4);
    packet.writeInt16LE(this.bIsDealOfTheDay, 8);
    return packet;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[StockCar]======================================");
    logger.debug(`brandedPartId:     ${this.brandedPartId}`);
    logger.debug(`retailPrice        ${this.retailPrice}`);
    logger.debug(`isDealOfTheDay:    ${this.bIsDealOfTheDay}`);
    logger.debug("[/StockCar]======================================");
  }
}
