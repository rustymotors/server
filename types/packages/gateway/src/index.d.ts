/// <reference types="node" resolution-mode="require"/>
import { NetworkSocket, BuiltinError, Logger, MessageProcessor, ServerConfiguration, ClientConnection, SocketWithConnectionInfo, SocketOnDataHandler, TSocketErrorHandler, TSocketEndHandler, ConnectionHandler, WebConnectionHandler } from "../../interfaces/index.js";
export { getAdminServer } from "./AdminServer.js";
export { getAllConnections } from "./ConnectionManager.js";
export declare const defaultLog: Logger;
/**
 *
 * @param {object} options
 * @param {ISocket} options.sock
 * @param {IError} options.error
 * @param {TServerLogger} options.log
 * @returns {void}
 */
export declare function socketErrorHandler({ sock, error, log, }: {
    sock: NetworkSocket;
    error: BuiltinError;
    log: Logger;
}): void;
export declare function socketDataHandler({ processMessage, data, logger, config, connection, connectionRecord, }: {
    processMessage?: MessageProcessor;
    data: Buffer;
    logger: Logger;
    config: ServerConfiguration;
    connection: ClientConnection;
    connectionRecord: SocketWithConnectionInfo;
}): void;
/**
 * Handle the end of a socket connection
 */
export declare function socketEndHandler({ log, connectionRecord, }: {
    log: Logger;
    connectionRecord: SocketWithConnectionInfo;
}): void;
export declare function validateAddressAndPort(localPort: number | undefined, remoteAddress: string | undefined): void;
/**
 * Handle incoming TCP connections
 *
 */
export declare function rawConnectionHandler({ incomingSocket, config, log, onSocketData, onSocketError, onSocketEnd, }: {
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
    onSocketData?: SocketOnDataHandler;
    onSocketError?: TSocketErrorHandler;
    onSocketEnd?: TSocketEndHandler;
}): void;
/**
 *
 * Listen for incoming connections on a socket
 *
 */
export declare function socketConnectionHandler({ onTCPConnection, onHTTPConnection, incomingSocket, config, log, }: {
    onTCPConnection?: ConnectionHandler;
    onHTTPConnection?: WebConnectionHandler;
    incomingSocket: NetworkSocket;
    config: ServerConfiguration;
    log: Logger;
}): void;
//# sourceMappingURL=index.d.ts.map