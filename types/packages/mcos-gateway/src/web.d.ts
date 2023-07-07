/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { TConfiguration, TServerLogger } from "mcos/shared/interfaces";
/**
 * Routes incomming HTTP requests
 */
export declare function httpListener(req: IncomingMessage, res: ServerResponse<IncomingMessage>, config: TConfiguration, log: TServerLogger): ServerResponse;
