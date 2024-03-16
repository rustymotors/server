/**
 * @module SubThread
 */

import { EventEmitter } from "node:events";
import { ServerLogger, getServerLogger } from "./log.js";

export class SubThread extends EventEmitter {
    name: any;
    log: any;
    loopInterval: number;
    timer: any;

    constructor(name: string, log: ServerLogger, loopInterval: number = 100) {
        super();
        this.name = name;
        this.log = log;
        this.loopInterval = loopInterval;
        this.init();
    }

    init() {
        this.emit("initialized");
        // @ts-expect-error
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
