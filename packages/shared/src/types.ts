import type { Socket } from "node:net";
import type { Configuration } from "../Configuration";
import type { KeypressEvent } from "..";

export type TServerLogger = {
    info: (message: string) => void;
    error: (message: string) => void;
    fatal: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
    trace: (message: string) => void;
    setName: (name: string) => void;
    getName: () => string;
    resetName: () => void;
};

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    userId: number;
}


export type TConsoleThread = {
    parentThread: TGateway;
    handleKeypressEvent: (key: KeypressEvent) => void;
    init: () => void;
    run: () => void;
    stop: () => void;
};

export interface TScheduledThread {
    parentThread: TGateway;
    stop(): void;
}

export type TGatewayOptions = {
    config?: Configuration;
    log: TServerLogger;
    backlogAllowedCount?: number;
    listeningPortList?: number[];
    socketConnectionHandler?: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log: TServerLogger;
    }) => void;
};

export type TGateway = {
    config: Configuration;
    log: TServerLogger;
    timer: NodeJS.Timeout | null;
    loopInterval: number;
    status: string;
    consoleEvents: string[];
    backlogAllowedCount: number;
    listeningPortList: number[];
    servers: import("node:net").Server[];
    socketconnection: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log: TServerLogger;
    }) => void;
    webServer: import("fastify").FastifyInstance | undefined;
    readThread: TConsoleThread | undefined;
    scheduledThread: TScheduledThread | undefined;
    start: () => Promise<void>;
    restart: () => Promise<void>;
    exit: () => Promise<void>;
    stop: () => Promise<void>;
    help: () => void;
    run: () => void;
    handleReadThreadEvent: (event: string) => void;
    init: () => Promise<void>;
    shutdown: () => void;
};
