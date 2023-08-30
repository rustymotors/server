import EventEmitter from "node:events";
import { SubprocessThread, GatewayServer, Logger } from "../interfaces/index.js";

export class SubThread extends EventEmitter implements SubprocessThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timeout | null = null;
    parentThread: GatewayServer | undefined;
    log: Logger;

    constructor(name: string, log: Logger, loopInterval = 100) {
        super();
        this.name = name;
        this.log = log;
        this.loopInterval = loopInterval;
        this.init();
    }

    init() {
        this.emit("initialized");
        this.timer = setInterval(this.run.bind(this), this.loopInterval);
    }

    run() {
        // Intentionally left blank
    }

    shutdown() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.emit("shutdownComplete");
    }
}
