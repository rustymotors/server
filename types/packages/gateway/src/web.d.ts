/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "pino";
import { Configuration } from "../../shared/Configuration.js";
/**
 * Routes incomming HTTP requests
 */
export declare function httpListener(req: IncomingMessage, res: ServerResponse<IncomingMessage>, config: Configuration, log: Logger): ServerResponse;
//# sourceMappingURL=web.d.ts.map