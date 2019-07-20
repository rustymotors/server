// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";
import { NPSPacketManager } from "../../../npsPacketManager";

const loggers = new Logger().getLoggers();

const npsPacketManager = new NPSPacketManager(loggers);

/*
    NPS messages are sent serialized in BE format
*/

// WORD	msgNo;    NPS message number

export enum MSG_DIRECTION {
  RECIEVED = "Recieved",
  SENT = "Sent",
}

export class NPSMsg {
  public msgNo: number;
  protected msgLength: number;
  protected msgVersion: number;
  protected reserved: number;
  protected content: Buffer;
  protected direction: MSG_DIRECTION;

  constructor(direction: MSG_DIRECTION) {
    this.msgNo = 0;
    this.msgVersion = 0;
    this.reserved = 0;
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    this.msgLength = this.content.length + 12;
    this.direction = direction;
  }

  public setContent(buffer: Buffer) {
    this.content = buffer;
    this.msgLength = this.content.length + 12;
  }

  public getContentAsBuffer() {
    return this.content;
  }

  public getPacketAsString() {
    return this.serialize().toString("hex");
  }

  public serialize() {
    try {
      const packet = Buffer.alloc(this.msgLength);
      packet.writeInt16BE(this.msgNo, 0);
      packet.writeInt16BE(this.msgLength, 2);
      if (this.msgLength > 4) {
        packet.writeInt16BE(this.msgVersion, 4);
        packet.writeInt16BE(this.reserved, 6);
      }
      if (this.msgLength > 8) {
        packet.writeInt32BE(this.msgLength, 8);
        this.content.copy(packet, 12);
      }
      return packet;
    } catch (error) {
      throw new Error(`[NPSMsg] Error in serialize(): ${error}`);
    }
  }

  public deserialize(packet: Buffer) {
    this.msgNo = packet.readInt16BE(0);
    this.msgLength = packet.readInt16BE(2);
    this.msgVersion = packet.readInt16BE(4);
    this.content = packet.slice(12);
    return this;
  }

  public dumpPacketHeader(messageType: string) {
    loggers.both.debug(
      `[NPSMsg/${messageType}] == ${this.direction} ==================`
    );
    loggers.both.debug(
      `MsgNo:         ${this.msgNo.toString(16)} (${
        this.msgNo
      }) [${npsPacketManager.msgCodetoName(this.msgNo)}]`
    );
    loggers.both.debug(`MsgVersion:    ${this.msgVersion}`);
    loggers.both.debug(`contentLength: ${this.msgLength}`);
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    this.dumpPacketHeader("NPSMsg");
    loggers.both.debug(`Content:       ${this.content.toString("hex")}`);
    loggers.both.debug(`Serialized:    ${this.serialize().toString("hex")}`);
    loggers.both.debug("[/NPSMsg]======================================");
  }

  public toJSON() {
    return {
      msgNo: this.msgNo.toString(16),
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString("hex"),
      direction: this.direction,
    };
  }
}
