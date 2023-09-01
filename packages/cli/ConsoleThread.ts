import { emitKeypressEvents } from "readline";
import { SubprocessThread, GatewayServer, Logger, KeypressEvent } from "../interfaces/index.js";
import { SubThread } from "../shared/SubThread.js";
import { ServerError } from "../shared/index.js";

export class ConsoleThread extends SubThread implements SubprocessThread {
    parentThread: GatewayServer | undefined;
    constructor({
        parentThread,
        log,
    }: {
        parentThread?: GatewayServer;
        log: Logger;
    }) {
        super("ReadInput", log, 100);
        if (parentThread === undefined) {
            throw new ServerError(
                "parentThread is undefined when creating ReadInput",
            );
        }
        this.parentThread = parentThread;
    }

    handleKeypressEvent(key: KeypressEvent) {
        const keyString = key.sequence;

        if (keyString === "x") {
            this.emit("userExit");
        }

        if (keyString === "r") {
            this.emit("userRestart");
        }

        if (keyString === "?") {
            this.emit("userHelp");
        }
    }

    init() {
        super.init();
        emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        this.log("info", "GatewayServer started");
        this.log("info", "Press x to quit");

        process.stdin.resume();
        process.stdin.on("keypress", (_str, key) => {
            if (key !== undefined) {
                this.handleKeypressEvent(key);
            }
        });
    }

    run() {
        // Intentionally left blank
    }

    stop() {
        // Remove all listeners from stdin, preventing further input
        process.stdin.removeAllListeners("keypress");
        process.stdin.pause();
        super.shutdown();
    }
}
