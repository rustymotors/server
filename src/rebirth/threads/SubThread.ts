import { ISubThread } from "mcos/shared/interfaces";
import EventEmitter from "node:events";

export class SubThread extends EventEmitter implements ISubThread {
    name: string;
    loopInterval: number;
    timer: NodeJS.Timer | null = null;
    /**
     *
     * @param {string} name
     * @param {number} [loopInterval=100]
     */
    constructor(name: string, loopInterval = 100) {
        super();
        this.name = name;
        this.loopInterval = loopInterval;
        this.init();
    }

    init() {
        console.log(`${this.name} SubThread() initialized.`);
        this.on("shutdown", this.shutdown.bind(this));
        this.timer = setInterval(this.run.bind(this), this.loopInterval);
    }

    run() {
        // console.log(`${this.name} SubThread() running.`);
    }

    shutdown() {
        console.log(`${this.name} SubThread() shutting down.`);
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.emit("shutdownComplete");
    }
}
