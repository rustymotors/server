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

import { logger } from "./logger";
import MsgHead from './MsgHead';

export default class MessageNode {
  public toFrom: Buffer;
  public appId: Buffer;
  public rawBuffer: Buffer;
  public seq: number;
  public flags: number;
  public header: MsgHead;
  public buffer: Buffer;
  public msgNo: number;
  constructor(packet: Buffer) {
    this.toFrom = Buffer.from([0x00, 0x00]);

    this.appId = Buffer.from([0x00, 0x00]);
  
    this.setBuffer(packet);
    this.setMsgHeader(packet);

    this.rawBuffer = packet

    if (packet.length <= 6) {
      throw new Error(`Packet too short!: ${packet.toString()}`);
    }

    try {
      this.msgNo = this.buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        logger.error(packet.toString("hex"))
        throw error 
      }
    }
    
  
    // DWORD seq; sequenceNo
    this.seq = packet.readInt32LE(6);
  
    this.flags = packet.readInt8(10);
  
  }

  public setMsgHeader(packet: Buffer) {
    const header = Buffer.alloc(6);
    packet.copy(header, 0, 0, 6);
    this.header = new MsgHead(header);
  }

  public setBuffer(packet: Buffer) {
    this.buffer = packet.slice(11);
  }

  public BaseMsgHeader(packet:Buffer) {

    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0);
  }

  public getBaseMsgHeader(packet: Buffer) {
    return this.BaseMsgHeader(packet);
  }

  public isMCOTS() {
    return this.header.mcosig === "TOMC";
  }

  public dumpPacket() {
    logger.debug("Packet has a valid MCOTS header signature");
    logger.info("=============================================");
    logger.debug(`Header Length: ${this.header.length}`);
    logger.debug(`Header MCOSIG: ${this.isMCOTS()}`);
    logger.debug(`Sequence: ${this.seq}`);
    logger.debug(`Flags: ${this.flags}`);
    logger.debug(`Buffer: ${this.buffer}`);
    logger.debug(`Buffer as text: ${this.buffer.toString("utf8")}`);
    logger.debug(`Buffer as string: ${this.buffer.toString("hex")}`);
    logger.debug(
      `Raw Buffer as string: ${this.rawBuffer.toString("hex")}`);
    logger.info("=============================================");
  }

}
