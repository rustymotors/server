// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as struct from "c-struct";
import { Logger } from "../logger";

const logger = new Logger().getLogger();

// tslint:disable: object-literal-sort-keys
const loginMsgSchema = new struct.Schema({
  msgNo: struct.type.uint16,
  customerId: struct.type.uint32,
  personaId: struct.type.uint32,
  lotOwnerId: struct.type.uint32,
  brandedPartId: struct.type.uint32,
  skinId: struct.type.uint32,
  personaName: struct.type.string(12),
  version: struct.type.string(),
});

// register to cache
struct.register("LoginMsg", loginMsgSchema);

export class LoginMsg {
  public appId: number;
  public toFrom: number;
  public msgNo: number;
  public customerId: number;
  public personaId: number;
  public lotOwnerId: number;
  public brandedPartId: number;
  public skinId: number;
  public personaName: string;
  public version: string;
  public data: Buffer;
  public struct: any;

  constructor(buffer: Buffer) {
    this.msgNo = 0;
    this.toFrom = 0;
    this.appId = 0;

    // TODO: Why do I set these if I turn around and deserialize after?
    this.customerId = 0;
    this.personaId = 0;
    this.lotOwnerId = 0;
    this.brandedPartId = 0;
    this.skinId = 0;
    this.personaName = "NotAPerson";
    this.version = "0.0.0.0";
    this.data = buffer;

    this.deserialize(buffer);
    this.struct = struct.unpackSync("LoginMsg", buffer);
  }

  public deserialize(buffer: Buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new Error(
          `[LoginMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${error}`
        );
      }
    }

    this.customerId = buffer.readInt32LE(2);
    this.personaId = buffer.readInt32LE(6);

    this.lotOwnerId = buffer.readInt32LE(10);
    this.brandedPartId = buffer.readInt32LE(14);
    this.skinId = buffer.readInt32LE(18);
    this.personaName = buffer.slice(22, 34).toString();

    this.version = buffer.slice(34).toString();
  }

  public serialize() {
    return this.data;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug("[LoginMsg]======================================");
    logger.debug(
      `MsgNo:          ${this.msgNo.toString()} = ${this.struct.msgNo}`
    );
    logger.debug(
      `customerId:     ${this.customerId.toString()} = ${
        this.struct.customerId
      }`
    );
    logger.debug(
      `personaId:      ${this.personaId.toString()} = ${this.struct.personaId}`
    );
    logger.debug(
      `lotOwnerId:     ${this.lotOwnerId} = ${this.struct.lotOwnerId}`
    );
    logger.debug(
      `brandedPartId:  ${this.brandedPartId} = ${this.struct.brandedPartId}`
    );
    logger.debug(`skinId:         ${this.skinId} = ${this.struct.skinId}`);
    logger.debug(
      `personaName:    ${this.personaName} = ${this.struct.personaName}`
    );

    logger.debug(`version:        ${this.version} = ${this.struct.version}`);
    logger.debug("[LoginMsg]======================================");
  }
}
