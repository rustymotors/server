import {
    IGatewayServer,
    ISubThread,
    TServerLogger,
} from "mcos/shared/interfaces";
import { SubThread } from "./SubThread.js";
import { ServerError } from "../../shared/ServerError.js";

export class ReadInput extends SubThread implements ISubThread {
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

    init() {
        super.init();
        process.stdin.setRawMode(true);
        process.stdin.resume();

        this.log("info", "GatewayServer started");
        this.log("info", "Press x to quit");

        // Listen for the x key to be pressed
        process.stdin.on("data", (key) => {
            const keyString = key.toString("utf8");
            if (keyString === "x") {
                this.emit("userExit");
                // Log that the server is shutting down and call the exit method
                if (this.parentThread !== undefined) {
                    this.parentThread.exit();
                }
            }

            if (keyString === "r") {
                this.emit("userRestart");
                // Log that the server is shutting down and call the shutdown method
                if (this.parentThread !== undefined) {
                    this.parentThread.restart();
                }
            }
        });
    }

    run() {
        // Intentionally left blank
    }

    stop() {
        // Remove all listeners from stdin, preventing further input
        process.stdin.removeAllListeners("data");
        process.stdin.pause();
        super.shutdown();
    }
}
