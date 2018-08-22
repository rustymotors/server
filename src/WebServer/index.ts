// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { IServerConfiguration } from "../IServerConfiguration";
import { logger } from "../logger";
import { PatchServer } from "./patchServer";
import { WebServer } from "./web";

export class Web {
  /**
   * Start HTTP and HTTPs connection listeners
   * TODO: This code may be better suited in web.js and patchServer.js
   */
  public async start(config: IServerConfiguration) {

    // Start the mock patch server
    const patchServer = new PatchServer();
    patchServer.start(config);
    logger.info("[webServer] Patch Server started");

    // Start the AuthLogin and shardlist servers
    const webServer = new WebServer();
    webServer.start(config);
    logger.info("[webServer] Web Server started");
  }
}
