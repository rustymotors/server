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

export class ClientConnectMsg {
  private appId: number;
  private msgNo: number;
  private customerId: number;
  private personaId: number;
  private custName: string;
  private personaName: string;
  private mcVersion: Buffer;

  constructor(buffer: Buffer) {
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

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.info("[ClientConnectMsg]======================================");
    logger.debug("MsgNo:       ", this.msgNo.toString());
    logger.debug("customerId:  ", this.customerId.toString());
    logger.debug("personaId:   ", this.personaId.toString());
    logger.debug("custName:    ", this.custName);
    logger.debug("personaName: ", this.personaName);
    logger.debug("mcVersion:   ", this.mcVersion.toString("hex"));
    logger.info("[ClientConnectMsg]======================================");
  }
}

module.exports = { ClientConnectMsg };
