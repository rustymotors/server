// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { WebServer } from "./WebServer";
import * as fs from "fs";

describe("WebServer", () => {
  test("can generate registry file", () => {
    const webServer = new WebServer();
    const staticRegistry = fs.readFileSync(
      webServer.config.serverConfig.registryFilename
    );
    const dynamicRegistry = webServer._handleGetRegistry();
    expect(dynamicRegistry).toEqual(staticRegistry.toString("utf-8"));
  });
});
