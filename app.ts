#!/usr/bin/env node
/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2021>  <Drazi Crendraven>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { ICoreConfig, MCOServer } from "./services/core/index.js";
import { logger } from "./src/logger/index.js";

const log = logger.child({ service: "mcos" });

const coreConfig: ICoreConfig = {
  logger,
  externalHost: "0.0.0.0",
  ports: [
    80, 6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005,
    9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43_200, 43_300,
    43_400, 53_303,
  ],
};

try {
  const s = MCOServer.init(coreConfig);
  s.run();
  s.stop();
} catch (e: unknown) {
  log.error("Error in core server");
  if (e instanceof Error) {
    log.error(e.message);
  } else {
    throw e;
  }
  log.error("Server exiting");
  process.exit(1);
}
