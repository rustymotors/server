// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { IPersonaRecord } from "../IPersonaRecord";
import { Logger } from "../logger";
import { NPSMsg } from "./NPSMsg";

const logger = new Logger().getLogger();

export class NPSPersonaMapsMsg {
  public personaCount: number;
  public maxPersonaCount: number;
  public id: number;
  public shardId: number;
  public name: string; // 30-bit null terminated string

  constructor() {
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

  public npsSerialize() {
    // Create the packet content
    const packetContent = Buffer.alloc(68);

    // This is the persona count
    packetContent.writeInt16BE(this.personaCount, 8);

    // This is the max persona count (confirmed - debug)
    packetContent.writeInt8(this.maxPersonaCount, 13);

    // PersonaId
    packetContent.writeUInt32BE(this.id, 16);

    // Shard ID
    packetContent.writeInt32BE(this.shardId, 20);

    // No clue
    Buffer.from([0x0a, 0x0d]).copy(packetContent, 28);

    // Persona Name = 30-bit null terminated string
    packetContent.write(this.name, 30);

    // Build the packet
    const responsePacket = new NPSMsg();
    responsePacket.msgNo = 0x607;
    responsePacket.setContent(packetContent.slice(0, 68));
    return responsePacket;
  }

  public dumpInfo() {
    logger.debug("[NPSPersonaMapsMsg]======================================");
    logger.debug(`personaCount:        ${this.personaCount}`);
    logger.debug(`maxPersonaCount:     ${this.maxPersonaCount}`);
    logger.debug(`id:                  ${this.id}`);
    logger.debug(`shardId:             ${this.shardId}`);
    logger.debug(`name:                ${this.name}`);
    logger.debug("[/NPSPersonaMapsMsg]======================================");
  }
}
