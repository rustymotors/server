// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { StockCar } from "./StockCar";
import { Logger } from "../../shared/loggerManager";

// WORD	msgNo;
// DWORD    starterCash; // when called from the create persona screen,
//                      //  this indicates how much cash a persona starts out with
// DWORD    dealerID;   // for easy match up
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;     // if 1, expect another msg, otherwise don't
// StockCar carInfo[1];

export class StockCarInfoMsg {
  public logger = new Logger().getLogger("StockCarMsg");
  public msgNo: number;
  public starterCash: number;
  public dealerId: number;
  public brand: number;
  public noCars: number;
  public moreToCome: number;
  public StockCarList: StockCar[];

  constructor(starterCash: number, dealerId: number, brand: number) {
    this.msgNo = 141;
    this.starterCash = 1;
    this.dealerId = 0;
    this.brand = 0;
    this.noCars = 1;
    this.moreToCome = 0;
    this.StockCarList = [];
  }

  public addStockCar(car: StockCar) {
    this.StockCarList.push(car);
    this.noCars = this.StockCarList.length;
  }

  public serialize() {
    // This does not count the StockCar array
    const packet = Buffer.alloc(17 + 9 * this.StockCarList.length);
    packet.writeInt16LE(this.msgNo, 0);
    packet.writeInt32LE(this.starterCash, 2);
    packet.writeInt32LE(this.dealerId, 6);
    packet.writeInt32LE(this.brand, 10);
    packet.writeInt16LE(this.noCars, 14);
    packet.writeInt8(this.moreToCome, 16);
    if (this.StockCarList.length > 0) {
      this.StockCarList.forEach((stockCar, i) => {
        const offset = 10 * i;
        stockCar.serialize().copy(packet, 17 + offset);
      });
    }
    return packet;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    this.logger.debug(
      {
        msgNo: this.msgNo,
        starterCash: this.starterCash,
        dealerId: this.dealerId,
        brand: this.brand,
        noCars: this.noCars,
        moreToCome: this.moreToCome,
        stockCarList: this.StockCarList.toString(),
      },
      "StockCarInfoMsg"
    );
  }
}
