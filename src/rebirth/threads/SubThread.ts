import {
    IGatewayServer,
    ISubThread,
    TServerLogger,
} from "mcos/shared/interfaces";
import EventEmitter from "node:events";

export class SubThread extends EventEmitter implements ISubThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timer | null = null;
    parentThread: IGatewayServer | undefined;
    log: TServerLogger;

    constructor(name: string, loopInterval: number = 100, log: TServerLogger) {
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
