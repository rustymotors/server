// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import * as path from "path";

export interface IServerConfiguration {
  serverConfig: {
    ipServer: string;
    certFilename: string;
    publicKeyFilename: string;
    privateKeyFilename: string;
    registryFilename: string;
  };
}

export class ConfigManager {
  public config = JSON.parse(
    fs.readFileSync("src/services/AuthLogin/config.json", "utf8")
  );

  public getConfig() {
    return this.config;
  }
}
