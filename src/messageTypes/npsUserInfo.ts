// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "../logger";

const logger = new Logger().getLogger();

export class NPSUserInfo {
  public userId: number;
  public userName: Buffer; // 30 length
  public userData: Buffer; // 64 length;

  constructor(rawData: Buffer) {
    this.userId = rawData.readInt32BE(4);
    this.userName = rawData.slice(8, 38);
    this.userData = rawData.slice(38);
  }

  public dumpInfo() {
    logger.debug("[NPSUserInfo]======================================");
    logger.debug(`UserId:        ${this.userId}`);
    logger.debug(`UserName:      ${this.userName.toString()}`);
    logger.debug(`UserData:      ${this.userData.toString("hex")}`);
    logger.debug("[/NPSUserInfo]======================================");
  }
}
