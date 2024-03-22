/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { type TServerLogger } from "@rustymotors/shared";
import { ServerLogger } from "@rustymotors/shared";
import { Socket } from "node:net";
import { GameMessage as OldGameMessage } from "../../nps/index.js";
import type { SocketCallback } from "../../nps/messageProcessors/index.js";
/**
 * @typedef {object} OnDataHandlerArgs
 * @property {object} args
 * @property {string} args.connectionId The connection id of the socket that
 *                                  received the data.
 * @property {module:packages/shared/RawMessage} args.message The data that was received.
 * @property {module:shared/log.ServerLogger} args.log
 *                                                                    response
 *                                                                to the
 *                                                           data.
 */
/**
 * @typedef {function} OnDataHandler
 * @param {OnDataHandlerArgs} args The arguments for the handler.
 * @returns {ServiceResponse} The
 *                                                                     response
 *                                                                  to the
 *                                                            data.
 */
/**
 * Handle socket errors
 */
export declare function socketErrorHandler({
    connectionId,
    error,
    log,
}: {
    connectionId: string;
    error: NodeJS.ErrnoException;
    log: TServerLogger;
}): void;
/**
 * Handle the end of a socket connection
 *
 * @param {object} options
 * @param {string} options.connectionId The connection ID
 * @param {ServerLogger} options.log The logger to use
 */
export declare function socketEndHandler({
    connectionId,
    log,
}: {
    connectionId: string;
    log: ServerLogger;
}): void;
/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {module:net.Socket} options.incomingSocket The incoming socket
 * @param {ServerLogger} options.log The logger to use
 *
 */
export declare function onSocketConnection({
    incomingSocket,
    log,
}: {
    incomingSocket: Socket;
    log: TServerLogger;
}): void;
export declare function processGameMessage(
    connectionId: string,
    message: OldGameMessage,
    log: TServerLogger,
    socketCallback: SocketCallback,
): void;
export declare function handleGameMessage(
    connectionId: string,
    bytes: Buffer,
    log: TServerLogger,
    socketCallback: SocketCallback,
): void;
export declare function handleServerMessage(
    connectionId: string,
    bytes: Buffer,
    log: ServerLogger,
    socketCallback: SocketCallback,
): void;
