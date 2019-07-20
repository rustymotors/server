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

export enum MSG_DIRECTION {
  RECIEVED = "Recieved",
  SENT = "Sent",
}

export class NPSMsg {
  public msgNameMapping = [
    { id: 0x120, name: "NPS_LOGIN_RESP" },
    { id: 0x128, name: "NPS_GET_MINI_USER_LIST" },
    { id: 0x207, name: "NPS_ACK" },
    { id: 0x229, name: "NPS_MINI_USER_LIST" },
    { id: 0x30c, name: "NPS_SEND_MINI_RIFF_LIST" },
    { id: 0x501, name: "NPS_USER_LOGIN" },
    { id: 0x503, name: "NPS_REGISTER_GAME_LOGIN" },
    { id: 0x532, name: "NPS_GET_PERSONA_MAPS" },
    { id: 0x607, name: "NPS_GAME_ACCOUNT_INFO" },
  ];
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

  public msgCodetoName(msgId: number) {
    const mapping = this.msgNameMapping.find(mapping => {
      return mapping.id === msgId;
    });
    return mapping ? mapping.name : "Unknown msgId";
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
    logger.debug(
      `[NPSMsg/${messageType}] == ${this.direction} ==================`
    );
    logger.debug(
      `MsgNo:         ${this.msgNo.toString(16)} (${
        this.msgNo
      }) [${this.msgCodetoName(this.msgNo)}]`
    );
    logger.debug(`MsgVersion:    ${this.msgVersion}`);
    logger.debug(`contentLength: ${this.msgLength}`);
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    this.dumpPacketHeader("NPSMsg");
    logger.debug(`Content:       ${this.content.toString("hex")}`);
    logger.debug(`Serialized:    ${this.serialize().toString("hex")}`);
    logger.debug("[/NPSMsg]======================================");
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
