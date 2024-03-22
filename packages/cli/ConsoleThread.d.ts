import { SubThread } from "@rustymotors/shared";
import { Gateway } from "../gateway/src/GatewayServer.js";
import type { TServerLogger } from "@rustymotors/shared";
/**
 * @module ConsoleThread
 */
/**
 * Console thread
 */
export declare class ConsoleThread extends SubThread {
    parentThread: Gateway;
    /**
     * @param {object} options
     * @param {Gateway} options.parentThread The parent thread
     * @param {ServerLogger} options.log The logger
     */
    constructor({
        parentThread,
        log,
    }: {
        parentThread: Gateway;
        log: TServerLogger;
    });
    /** @param {import("../interfaces/index.js").KeypressEvent} key */
    handleKeypressEvent(
        key: import("../interfaces/index.js").KeypressEvent,
    ): void;
    init(): void;
    run(): void;
    stop(): void;
}
