import { IRawPacket } from "./listenerThread";

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

export default class MsgPack {
  private sourcePacket: Buffer;
  private opCode: number;
  private msgLength: number;

  constructor(packet: Buffer) {
    this.sourcePacket = packet;
    this.setOpCode(packet.readInt16BE(0));
    this.setMsgLength(packet.readInt16BE(2));
  }

  /**
   * getOpCode
   */
  public getOpCode() {
    return this.opCode;
  }

  /**
   * getMsgLength
   */
  public getMsgLength() {
    return this.msgLength;
  }

  private setOpCode(opCode: number) {
    this.opCode = opCode;
  }

  private setMsgLength(msgLen: number) {
    this.msgLength = msgLen;
  }

}

