import { SubThread } from "mcos/shared";
import { IGatewayServer, IKeypressEvent, ISubThread, TServerLogger } from "mcos/shared/interfaces";
export declare class ConsoleThread extends SubThread implements ISubThread {
    parentThread: IGatewayServer | undefined;
    constructor({ parentThread, log, }: {
        parentThread?: IGatewayServer;
        log: TServerLogger;
    });
    handleKeypressEvent(key: IKeypressEvent): void;
    init(): void;
    run(): void;
    stop(): void;
}
