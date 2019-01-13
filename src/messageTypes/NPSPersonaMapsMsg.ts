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
  public personas: IPersonaRecord[] = [];
  // public personaSize = 1296;
  public personaSize = 40;

  constructor(direction: MSG_DIRECTION) {
    super(direction);
    this.msgNo = 0x607;
    this.personaCount = 0;
  }

  public loadMaps(personas: IPersonaRecord[]): any {
    if (personas.length >= 0) {
      this.personaCount = personas.length;
      this.personas = personas;
    }
  }

  public deserializeInt8(buf: Buffer) {
    return buf.readInt8(0);
  }

  public deserializeInt32(buf: Buffer) {
    return buf.readInt32BE(0);
  }

  public deserializeString(buf: Buffer) {
    return buf.toString("utf8");
  }

  public serialize() {
    let index = 0;
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount);

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0
      );

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5
      );

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8
      );

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12
      );

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20
      );

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22
      );
      index++;
    }

    // Build the packet
    super.setContent(packetContent);
    return super.serialize();
  }

  public dumpPacket() {
    logger.debug(`[NPSPersonaMapsMsg] = ${this.direction} ===============`);
    logger.debug(
      `MsgNo:               ${this.msgNo.toString(16)} (${this.msgNo})`
    );
    logger.debug(`MsgVersion:          ${this.msgVersion}`);
    logger.debug(`contentLength:       ${this.msgLength}`);
    logger.debug(`personaCount:        ${this.personaCount}`);
    logger.debug(
      `maxPersonaCount:     ${this.deserializeInt8(
        this.personas[0].maxPersonas
      )}`
    );
    logger.debug(
      `id:                  ${this.deserializeInt32(this.personas[0].id)}`
    );
    logger.debug(
      `shardId:             ${this.deserializeInt32(this.personas[0].shardId)}`
    );
    logger.debug(
      `name:                ${this.deserializeString(this.personas[0].name)}`
    );
    logger.debug(`Packet as hex:       ${this.getPacketAsString()}`);
    logger.debug("[/NPSPersonaMapsMsg]======================================");
  }
}
