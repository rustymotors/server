// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

/*
    NPS messages are sent serialized in BE format
*/

// WORD	msgNo;    NPS message number

export class NPSMsg {
  public msgNo: number;
  private contentLength: number;
  private content: Buffer;

  constructor() {
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    this.msgNo = 0;
    this.contentLength = this.content.length;
  }

  public setContent(buffer: Buffer) {
    this.content = buffer;
    this.contentLength = this.content.length + 4;
  }

  public getContentAsBuffer() {
    return this.content;
  }

  public getContentAsString() {
    return this.content.toString("hex");
  }

  public serialize() {
    const packet = Buffer.alloc(this.contentLength);
    packet.writeInt16BE(this.msgNo, 0);
    packet.writeInt16BE(this.contentLength, 2);
    this.content.copy(packet, 4);
    return packet;
  }

  public deserialize(packet: Buffer) {
    this.msgNo = packet.readInt16BE(0);
    this.contentLength = packet.readInt16BE(2);
    this.content = packet.slice(4);
    return this;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[NPSMsg]======================================");
    logger.debug(`MsgNo:         ${this.msgNo}`);
    logger.debug(`contentLength: ${this.contentLength}`);
    logger.debug(`Content:       ${this.content.toString("hex")}`);
    logger.debug(`Serialized:    ${this.serialize().toString("hex")}`);
    logger.debug("[/NPSMsg]======================================");
  }
}
