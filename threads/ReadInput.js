import { SubThread } from "./SubThread.js";

export class ReadInput extends SubThread {
    constructor() {
        super("ReadInput");
    }

    init() {
        super.init();
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

    shutdown() {
        process.stdin.pause();
        process.stdin.setRawMode(false);
        super.shutdown();
    }
}
