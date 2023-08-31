import { SubprocessThread, GatewayServer, Logger, KeypressEvent } from "../interfaces/index.js";
import { SubThread } from "../shared/SubThread.js";
export declare class ConsoleThread extends SubThread implements SubprocessThread {
    parentThread: GatewayServer | undefined;
    constructor({ parentThread, log, }: {
        parentThread?: GatewayServer;
        log: Logger;
    });
    handleKeypressEvent(key: KeypressEvent): void;
    init(): void;
    run(): void;
    stop(): void;
}
//# sourceMappingURL=ConsoleThread.d.ts.map