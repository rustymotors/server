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

/*
    NPS messages are sent serialized in BE format
*/

// WORD	msgNo;    NPS message number

export class NPSMsg {
  public msgNo: number;
  private contentLength: number;
  private content: Buffer;

  constructor() {
    this.setContent(Buffer.from([0x01, 0x02, 0x03, 0x04]));
  }

  public setContent(buffer: Buffer) {
    this.content = buffer;
    this.contentLength = this.content.length;
  }

  public getContentAsBuffer() {
    return this.content;
  }

  public getContentAsString() {
    return this.content.toString("hex");
  }

  public serialize() {
    const packet = Buffer.alloc(this.contentLength + 4);
    packet.writeInt16BE(this.msgNo, 0);
    packet.writeInt16BE(this.contentLength, 2);
    this.content.copy(packet, 4);
    return packet;
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
