/**
 * @module SubThread
 */

import { EventEmitter } from "node:events";
import { ServerLogger, getServerLogger } from "./log.js";
import { TServerLogger } from "./types.js";

export class SubThread extends EventEmitter {
    name: any;
    log: any;
    loopInterval: number;
    timer: any;

    constructor(name: string, log: TServerLogger, loopInterval: number = 100) {
        super();
        this.name = name;
        this.log = log;
        this.loopInterval = loopInterval;
        this.init();
    }

    init() {
        this.emit("initialized");
        // @ts-ignore
        this.timer = setInterval(this.run.bind(this), this.loopInterval);
    }

    run() {
        // Intentionally left blank
    }

    shutdown() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.emit("shutdownComplete");
    }
}
