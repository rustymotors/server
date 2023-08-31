/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from "http";
import { Logger, ServerConfiguration } from "../../interfaces/index.js";
/**
 * Routes incomming HTTP requests
 */
export declare function httpListener(req: IncomingMessage, res: ServerResponse<IncomingMessage>, config: ServerConfiguration, log: Logger): ServerResponse;
//# sourceMappingURL=web.d.ts.map