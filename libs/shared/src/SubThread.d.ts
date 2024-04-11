/**
 * @module SubThread
 */
/// <reference types="node" />
import { EventEmitter } from "node:events";
import type { TServerLogger } from "./types.js";
export declare class SubThread extends EventEmitter {
    name: any;
    log: any;
    loopInterval: number;
    timer: any;
    constructor(name: string, log: TServerLogger, loopInterval?: number);
    init(): void;
    run(): void;
    shutdown(): void;
}
