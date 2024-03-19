/* 
Rusty Motors provides a server for a legacy commercial racing game
Copyright (C) 2024  Molly Crendraven

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { IncomingMessage, Server, ServerResponse } from "node:http";
import { ILogger, IWebServer } from "./types.js";
import EventEmitter from "node:events";
import { onRequest, setupRoutes } from "./routeHandlers.js";

/**
 * @module web
 */

/**
 * A web server for the legacy commercial racing game
 * @extends EventEmitter
 * @implements IWebServer
 * @fires WebServer#closed
 */
export class WebServer extends EventEmitter implements IWebServer {
    static instance: WebServer;
    listeningPort: number = 3000;
    nodeServer: Server;
    log: ILogger;

    constructor(listeningPort: number, log: ILogger) {
        super();
        this.log = log;
        this.listeningPort = listeningPort;
        this.nodeServer = new Server((request, response) =>
            onRequest(request, response, log),
        );
        setupRoutes();
        this.nodeServer.listen(this.listeningPort, () => {
            this.log.info(`Web server listening on port ${this.listeningPort}`);
        });

        if (WebServer.instance) {
            return WebServer.instance;
        }
        WebServer.instance = this;
    }

    close() {
        this.nodeServer.close(this.emit.bind(this, "closed"));
    }
}
