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
import { StockCar } from "./StockCar";

// WORD	msgNo;
// DWORD    starterCash; // when called from the create persona screen,
//                      //  this indicates how much cash a persona starts out with
// DWORD    dealerID;   // for easy match up
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;     // if 1, expect another msg, otherwise don't
// StockCar carInfo[1];

export class StockCarInfoMsg {
  public msgNo: number;
  public starterCash: number;
  public dealerId: number;
  public brand: number;
  public noCars: number;
  public moreToCome: number;
  public StockCarList: StockCar[];

  constructor() {
    this.msgNo = 141;
    this.starterCash = 1;
    this.noCars = 1;
    this.moreToCome = 0;
    this.StockCarList = [];
  }

  public serialize() {
    // This does not count the StockCar array
    const packet = Buffer.alloc(17);
    packet.writeInt16LE(this.msgNo, 0);
    packet.writeInt32LE(this.starterCash, 2);
    packet.writeInt32LE(this.dealerId, 6);
    packet.writeInt32LE(this.brand, 10);
    packet.writeInt16LE(this.noCars, 14);
    packet.writeInt8(this.moreToCome, 16);
    return packet;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[StockCarInfoMsg]======================================");
    logger.debug(`MsgNo:        ${this.msgNo}`);
    logger.debug(`starterCash:  ${this.starterCash}`);
    logger.debug(`dealerId:     ${this.dealerId}`);
    logger.debug(`brand:        ${this.brand}`);
    logger.debug(`noCars:       ${this.noCars}`);
    logger.debug(`moreToCome:   ${this.moreToCome}`);
    logger.debug("[/StockCarInfoMsg]======================================");
  }
}
