/**
 * @module SubThread
 */

import { EventEmitter } from "node:events";
import { getServerLogger } from "./log.js";

export class SubThread extends EventEmitter {
    /**
     * @param {string} name
     * @param {module:shared/log.ServerLogger} log
     * @param {number} [loopInterval=100]
     */
    constructor(
        name,
        log = getServerLogger({ module: "SubThread" }),
        loopInterval = 100,
    ) {
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
