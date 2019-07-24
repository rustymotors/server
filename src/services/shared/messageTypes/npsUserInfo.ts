// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as bunyan from "bunyan";
import { NPSMsg, MSG_DIRECTION } from "./NPSMsg";
import { Logger } from "../../../loggerManager";

export class NPSUserInfo extends NPSMsg {
  public logger: bunyan;
  public userId: number = 0;
  public userName: Buffer = Buffer.from([0x00]); // 30 length
  public userData: Buffer = Buffer.from([0x00]); // 64 length;

  constructor(direction: MSG_DIRECTION) {
    super(direction);
    this.logger = new Logger().getLogger("NPSUserInfo");
  }

  public deserialize(rawData: Buffer) {
    this.userId = rawData.readInt32BE(4);
    this.userName = rawData.slice(8, 38);
    this.userData = rawData.slice(38);
    return this;
  }

  public dumpInfo() {
    this.dumpPacketHeader("NPSUserInfo");
    this.logger.debug(`UserId:        ${this.userId}`);
    this.logger.debug(`UserName:      ${this.userName.toString()}`);
    this.logger.debug(`UserData:      ${this.userData.toString("hex")}`);
    this.logger.debug("[/NPSUserInfo]======================================");
  }
}
