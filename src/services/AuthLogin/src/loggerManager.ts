// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as bunyan from "bunyan";
const BunyanToGelfStream = require("bunyan-gelf");

export class Logger {
  public getLogger(service: string) {
    const logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: service });
    logger.addStream({
      type: "raw",
      stream: new BunyanToGelfStream({
        host: "graylog",
        port: 12201,
      }),
    });
    logger.addSerializers(bunyan.stdSerializers);

    return logger;
  }
}
