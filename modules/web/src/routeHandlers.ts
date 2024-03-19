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

import { IncomingMessage, ServerResponse } from "node:http";
import { ILogger } from "./types.js";
import { routes } from "./routes.js";
import { healthEndpoint } from "./internal/healthEndpoint.js";

export function setupRoutes() {
    routes.add(healthEndpoint());
}

export function onRequest(
    request: IncomingMessage,
    response: ServerResponse,
    log: ILogger,
) {
    const { method, url } = request;

    log.info(`${method} ${url}`);
    const route = routes.find(url || "", method || "");
    if (route) {
        route.handle(request, response).catch((error) => {
            log.error(error.message);
            response.writeHead(500);
            response.end();
        });
    } else {
        response.writeHead(404);
        response.end();
    }
}
