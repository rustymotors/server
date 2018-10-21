// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { IPersonaRecord } from "../IPersonaRecord";
import { Logger } from "../logger";
import { MSG_DIRECTION, NPSMsg } from "./NPSMsg";

const logger = new Logger().getLogger();

export class NPSPersonaMapsMsg extends NPSMsg {
  public personaCount: number;
  public maxPersonaCount: number;
  public id: number;
  public shardId: number;
  public name: string; // 30-bit null terminated string

  constructor(direction: MSG_DIRECTION) {
    super(direction);
    this.msgNo = 0x607;
    this.personaCount = 0;
    this.maxPersonaCount = 0;
    this.id = 0;
    this.shardId = 0;
    this.name = "";
  }

  public loadMaps(personas: IPersonaRecord[]): any {
    if (personas.length >= 0) {
      this.id = personas[0].id.readInt32BE(0);
      this.personaCount = 1;
      this.maxPersonaCount = personas[0].maxPersonas.readInt8(0);
      this.shardId = personas[0].shardId.readInt32BE(0);
      this.name = personas[0].name.toString("utf8");
    }
  }

  public serialize() {
    // Create the packet content
    const packetContent = Buffer.alloc(68);

    // This is the persona count
    packetContent.writeInt16BE(this.personaCount, 0);

    // This is the max persona count (confirmed - debug)
    packetContent.writeInt8(this.maxPersonaCount, 5);

    // PersonaId
    packetContent.writeUInt32BE(this.id, 8);

    // Shard ID
    packetContent.writeInt32BE(this.shardId, 12);

    // No clue, but the persona name does not display without it.
    Buffer.from([0x0a, 0x0d]).copy(packetContent, 20);

    // Persona Name = 30-bit null terminated string
    packetContent.write(this.name, 22);

    // Build the packet
    logger.info(packetContent.toString("hex"));
    super.setContent(packetContent);
    logger.info(super.serialize().toString("hex"));
    return super.serialize();
  }

  public dumpPacket() {
    logger.debug(`[NPSPersonaMapsMsg] = ${this.direction} ===============`);
    logger.debug(
      `MsgNo:               ${this.msgNo.toString(16)} (${this.msgNo})`
    );
    logger.debug(`MsgVersion:          ${this.msgVersion}`);
    logger.debug(`contentLength:       ${this.msgLength}`);
    logger.debug(`Content:             ${this.content.toString("hex")}`);
    logger.debug(`Serialized:          ${this.serialize().toString("hex")}`);
    logger.debug(`personaCount:        ${this.personaCount}`);
    logger.debug(`maxPersonaCount:     ${this.maxPersonaCount}`);
    logger.debug(`id:                  ${this.id}`);
    logger.debug(`shardId:             ${this.shardId}`);
    logger.debug(`name:                ${this.name}`);
    logger.debug(`Packet as hex:       ${this.getPacketAsString()}`);
    logger.debug("[/NPSPersonaMapsMsg]======================================");
  }
}
