import { ServerError, SubThread } from "mcos/shared";
import {
    IGatewayServer,
    IKeypressEvent,
    ISubThread,
    TServerLogger,
} from "mcos/shared/interfaces";
import { emitKeypressEvents } from "readline";

export class ConsoleThread extends SubThread implements ISubThread {
    parentThread: IGatewayServer | undefined;
    constructor({
        parentThread,
        log,
    }: {
        parentThread?: IGatewayServer;
        log: TServerLogger;
    }) {
        super("ReadInput", log, 100);
        if (parentThread === undefined) {
            throw new ServerError(
                "parentThread is undefined when creating ReadInput"
            );
        }
        this.parentThread = parentThread;
    }

    handleKeypressEvent(key: IKeypressEvent) {
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
        process.stdin.on("keypress", (str, key) => {
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
