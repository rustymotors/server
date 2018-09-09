// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

export class LoginMsg {
  private msgNo: number;
  private customerId: number;
  private personaId: number;
  private lotOwnerId: number;
  private brandedPartId: number;
  private skinId: number;
  private personaName: string;
  private version: string;
  private data: Buffer;

  constructor(buffer: Buffer) {
    this.data = buffer;

    this.deserialize(buffer);
  }

  public deserialize(buffer: Buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new Error(
          `[LoginMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${error}`
        );
      }
    }

    this.customerId = buffer.readInt32LE(2);
    this.personaId = buffer.readInt32LE(6);

    this.lotOwnerId = buffer.readInt32LE(10);
    this.brandedPartId = buffer.readInt32LE(14);
    this.skinId = buffer.readInt32LE(18);
    this.personaName = buffer.slice(22, 34).toString();

    this.version = buffer.slice(34).toString();
  }

  public serialize() {
    return this.data;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[LoginMsg]======================================");
    logger.debug(`MsgNo:          ${this.msgNo.toString()}`);
    logger.debug(`customerId:     ${this.customerId.toString()}`);
    logger.debug(`personaId:      ${this.personaId.toString()}`);
    logger.debug(`lotOwnerId:     ${this.lotOwnerId}`);
    logger.debug(`brandedPartId:  ${this.brandedPartId}`);
    logger.debug(`skinId:         ${this.skinId}`);
    logger.debug(`personaName:    ${this.personaName}`);

    logger.debug(`version:        ${this.version}`);
    logger.debug("[LoginMsg]======================================");
  }
}
