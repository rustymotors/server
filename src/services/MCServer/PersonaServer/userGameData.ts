// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as struct from "c-struct";
import { Logger } from "../../shared/loggerManager";
import { IPersonaRecord } from "./IPersonaRecord";
import { NPSMsg } from "../MCOTS/NPSMsg";

// tslint:disable: object-literal-sort-keys
const npsUserGameDataSchema = new struct.Schema({
  msgNo: struct.type.uint16,
  msgLength: struct.type.uint16,
  msgVersion: struct.type.uint16,
  reserved: struct.type.uint16,
  msgChecksum: struct.type.uint32,
  // End of header
  personaCount: struct.type.uint16,
  personas: [
    {
      customerId: struct.type.uint32,
      gameUserName: struct.type.string(33),
      serverDataId: struct.type.uint32,
      createDate: struct.type.uint32,
      lastLogin: struct.type.uint32,
      numGames: struct.type.uint32,
      gameUserId: struct.type.uint32,
      isOnSystem: struct.type.uint16,
      gamePurchaseDate: struct.type.uint32,
      gameSerialNumber: struct.type.string(33),
      timeOnLine: struct.type.uint32,
      timeInGame: struct.type.uint32,
      gameSpecific: struct.type.string(512),
      personalBlob: struct.type.string(256),
      pictureBlob: struct.type.string(1),
      dnd: struct.type.uint16,
      gameStart: struct.type.uint32,
      currentKey: struct.type.string(400),
      personaLevel: struct.type.uint16,
      shardId: struct.type.uint16,
    },
  ],
});

// register to cache
struct.register("UserGameData", npsUserGameDataSchema);

export class UserGameData extends NPSMsg {
  public logger = new Logger().getLogger("NPSUserGameData");
  public struct: any;
  public personas: IPersonaRecord[] = [];

  constructor() {
    super("Sent");
    try {
      this.struct = struct.unpackSync("UserGameData", Buffer.alloc(1300));
    } catch (error) {
      console.trace(error);
      this.logger.error({ error }, `Error unpacking struct`);
      process.exit(-1);
    }
  }

  public loadMaps(personas: IPersonaRecord[]): any {
    if (personas.length >= 0) {
      this.struct.personaCount = personas.length;
      this.personas = [];
      try {
        personas.forEach((persona, idx) => {
          this.struct.personas[idx] = {
            personaCount: personas.length,
            maxPersonas: personas.length,
            id: this.deserializeInt32(persona.id),
            personaNameLength: this.deserializeString(persona.name).length,
            name: this.deserializeString(persona.name),
            shardId: this.deserializeInt32(persona.shardId),
          };
        });
      } catch (error) {
        this.logger.error({ personas }, `Error loading personas`);
      }
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
    // Build the packet
    const msgLength = struct.packSync("UserGameData", this.struct).length;
    this.struct.msgNo = 0x607;
    this.struct.personaCount = 0;
    this.struct.msgLength = msgLength;
    this.struct.msgChecksum = msgLength;
    try {
      return struct.packSync("UserGameData", this.struct, {
        endian: "b",
      });
    } catch (error) {
      console.trace(error);
      this.logger.error({ error }, `Error packing struct`);
      process.exit(-1);
    }
  }
}
