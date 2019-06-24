// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// tslint:disable:object-literal-sort-keys

import { Logger } from "../logger";
import { LobbyInfo } from "./LobbyInfo";
import { MessageNode } from "./MessageNode";

const logger = new Logger().getLogger();

export class LobbyMsg {
  public msgNo: number;
  public noLobbies: number;
  public moreToCome: number;
  public data: Buffer;

  private lobbyList: LobbyInfo;
  private dataLength: number;

  constructor() {
    this.msgNo = 325;

    this.noLobbies = 1;
    this.moreToCome = 0;

    this.lobbyList = new LobbyInfo();
    // this.dataLength = 572;
    this.dataLength = this.lobbyList.toPacket().length + 5;

    this.data = Buffer.alloc(this.dataLength);
    this.data.writeInt16LE(this.msgNo, 0);
    this.data.writeInt16LE(this.noLobbies, 2);
    this.data.writeInt8(this.moreToCome, 4);
    this.lobbyList.toPacket().copy(this.data, 5);
  }

  public serialize() {
    return this.data;
  }

  /**
   * dumpPacket
   */
  public dumpPacket() {
    logger.debug(`[LobbyMsg]======================================`);
    logger.debug(`MsgNo:       ${this.msgNo}`);
    logger.debug(`dataLength:  ${this.dataLength}`);
    logger.debug(`packet:      ${this.serialize().toString("hex")}`);
    logger.debug(`[LobbyMsg]======================================`);
  }
}
