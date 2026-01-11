import type { Configuration, ServerLogger, TaggedTcpSocket } from "rusty-motors-shared";
import type { Socket } from "node:net";

export type PortRouterArgs = {
	taggedSocket: TaggedTcpSocket;
	log?: ServerLogger;
};

export type PortRouter = (portRouterArgs: PortRouterArgs) => Promise<void>;

export interface GatewayOptions {
    config?: Configuration;
    log?: ServerLogger;
    backlogAllowedCount?: number;
    tcpListeningPortList?: number[];
    udpListeningPortList?: number[];
    webPort?: number; // Web server port (default: 3000)
    socketConnectionHandler?: ({
        incomingSocket,
        log,
    }: {
        incomingSocket: Socket;
        log?: ServerLogger;
    }) => void;
}
