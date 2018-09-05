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

import { Logger } from "../logger";

const logger = new Logger().getLogger();

// WORD	msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD	msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD	result; // specific to the message sent, often the reason for a failure
// DWORD	data;   // specific to the message sent (but usually 0)
// DWORD	data2;

export class GenericReplyMsg {
  public msgNo: number;
  public msgReply: number;
  private result: Buffer;
  private data: Buffer;
  private data2: Buffer;

  constructor() {
    this.result = Buffer.alloc(4);
    this.data = Buffer.alloc(4);
    this.data2 = Buffer.alloc(4);
  }

  public deserialize(buffer: Buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        logger.error(buffer.toString("hex"));
        throw error;
      }
    }

    this.msgReply = buffer.readInt16LE(2);
    this.result = buffer.slice(4, 8);
    this.data = buffer.slice(8, 12);
    this.data2 = buffer.slice(12);
  }

  public serialize() {
    const packet = Buffer.alloc(16);
    packet.writeInt16LE(this.msgNo, 0);
    packet.writeInt16LE(this.msgReply, 2);
    this.result.copy(packet, 4);
    this.data.copy(packet, 8);
    this.data2.copy(packet, 12);
    return packet;
  }

  public setResult(buffer: Buffer) {
    this.result = buffer;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[GenericReply]======================================");
    logger.debug(`MsgNo:       ${this.msgNo}`);
    logger.debug(`MsgReply:    ${this.msgReply}`);
    logger.debug(`result:      ${this.result.toString("hex")}`);
    logger.debug(`data:        ${this.data.toString("hex")}`);
    logger.debug(`data2:       ${this.data2.toString("hex")}`);
    logger.debug("[/GenericReply]======================================");
  }
}
