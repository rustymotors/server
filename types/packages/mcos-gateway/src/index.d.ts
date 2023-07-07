/// <reference types="node" />
import { IConnection, IError, ISocket, THTTPConnectionHandler, TMessageProcessor, TConfiguration, TServerLogger, TSocketDataHandler, TSocketEndHandler, TSocketErrorHandler, TSocketWithConnectionInfo, TTCPConnectionHandler } from "mcos/shared/interfaces";
export { getAdminServer } from "./AdminServer.js";
export { getAllConnections } from "./ConnectionManager.js";
export declare const defaultLog: TServerLogger;
/**
 *
 * @param {object} options
 * @param {ISocket} options.sock
 * @param {IError} options.error
 * @param {TServerLogger} options.log
 * @returns {void}
 */
export declare function socketErrorHandler({ sock, error, log, }: {
    sock: ISocket;
    error: IError;
    log: TServerLogger;
}): void;
export declare function socketDataHandler({ processMessage, data, logger, config, connection, connectionRecord, }: {
    processMessage?: TMessageProcessor;
    data: Buffer;
    logger: TServerLogger;
    config: TConfiguration;
    connection: IConnection;
    connectionRecord: TSocketWithConnectionInfo;
}): void;
/**
 * Handle the end of a socket connection
 */
export declare function socketEndHandler({ log, connectionRecord, }: {
    log: TServerLogger;
    connectionRecord: TSocketWithConnectionInfo;
}): void;
export declare function validateAddressAndPort(localPort: number | undefined, remoteAddress: string | undefined): void;
/**
 * Handle incoming TCP connections
 *
 */
export declare function rawConnectionHandler({ incomingSocket, config, log, onSocketData, onSocketError, onSocketEnd, }: {
    incomingSocket: ISocket;
    config: TConfiguration;
    log: TServerLogger;
    onSocketData?: TSocketDataHandler;
    onSocketError?: TSocketErrorHandler;
    onSocketEnd?: TSocketEndHandler;
}): void;
/**
 *
 * Listen for incoming connections on a socket
 *
 */
export declare function socketConnectionHandler({ onTCPConnection, onHTTPConnection, incomingSocket, config, log, }: {
    onTCPConnection?: TTCPConnectionHandler;
    onHTTPConnection?: THTTPConnectionHandler;
    incomingSocket: ISocket;
    config: TConfiguration;
    log: TServerLogger;
}): void;
