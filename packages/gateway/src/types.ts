import type { TaggedSocket } from './socketUtility.js';
import type { Configuration } from 'rusty-motors-shared';
import type { Socket } from 'node:net';
import { ServerLogger } from 'rusty-motors-logger';

export type PortRouterArgs = {
    taggedSocket: TaggedSocket;
    log?: ServerLogger;
};

export type PortRouter = (portRouterArgs: PortRouterArgs) => Promise<void>;

export interface GatewayOptions {
    config?: Configuration;
    log?: ServerLogger;
    backlogAllowedCount?: number;
    listeningPortList?: number[];
    socketConnectionHandler?: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log?: ServerLogger;
    }) => void;
}
