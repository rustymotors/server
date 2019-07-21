// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as bunyan from "bunyan";

export class ClientConnectMsg {
  public logger: bunyan;
  public customerId: number;
  public personaId: number;
  public personaName: string;
  public msgNo: number;
  private appId: number;
  private custName: string;
  private mcVersion: Buffer;

  constructor(buffer: Buffer) {
    this.logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: "ClientConnectMsg" });

    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0;
      } else {
        throw new Error(
          `[ClientConnectMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${error}`
        );
      }
    }

    this.customerId = buffer.readInt32LE(2);
    this.personaId = buffer.readInt32LE(6);

    // Set the appId to the Persona Id
    this.appId = this.personaId;

    this.customerId = buffer.readInt32LE(2);
    this.custName = buffer.slice(10, 41).toString();
    this.personaName = buffer.slice(42, 73).toString();
    this.mcVersion = buffer.slice(74);
    return this;
  }

  public getAppId() {
    return this.appId;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    this.logger.info(
      "[ClientConnectMsg]======================================"
    );
    this.logger.debug("MsgNo:       ", this.msgNo.toString());
    this.logger.debug("customerId:  ", this.customerId.toString());
    this.logger.debug("personaId:   ", this.personaId.toString());
    this.logger.debug("custName:    ", this.custName);
    this.logger.debug("personaName: ", this.personaName);
    this.logger.debug("mcVersion:   ", this.mcVersion.toString("hex"));
    this.logger.info(
      "[ClientConnectMsg]======================================"
    );
  }
}

module.exports = { ClientConnectMsg };
