/// <reference types="node" />
/// <reference types="node" />
import { IGatewayServer, ISubThread, TServerLogger } from "mcos/shared/interfaces";
import EventEmitter from "node:events";
export declare class SubThread extends EventEmitter implements ISubThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timer | null;
    parentThread: IGatewayServer | undefined;
    log: TServerLogger;
    constructor(name: string, log: TServerLogger, loopInterval?: number);
    init(): void;
    run(): void;
    shutdown(): void;
}
