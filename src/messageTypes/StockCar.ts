// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { logger } from "../logger";

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

export class StockCar {
  private brandedPartId: number;
  private retailPrice: number;
  private bIsDealOfTheDay: number;

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
