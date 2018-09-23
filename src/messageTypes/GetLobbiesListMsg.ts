// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

export class GetLobbiesListMsg {
  private customerId: number;
  private personaId: number;

  private msgNo: number;
  constructor(buffer: Buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0;
      } else {
        throw new Error(
          `[GetLobbiesListMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${error}`
        );
      }
    }

    this.customerId = buffer.readInt32LE(2);
    this.personaId = buffer.readInt32LE(6);

    return this;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[LobbiesListMsg]======================================");
    logger.debug("MsgNo:       ", this.msgNo.toString());
    logger.debug("customerId:  ", this.customerId.toString());
    logger.debug("personaId:   ", this.personaId.toString());
    logger.debug("[LobbiesListMsg]======================================");
  }
}
