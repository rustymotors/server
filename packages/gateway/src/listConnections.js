/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */

import { WebJSONResponse } from "../../interfaces/index.js";
import { State, WrappedSocket,  } from "../../shared/State.js";

export function listConnections(
    state: State
): WebJSONResponse {

    const sockets = state.sockets;

    const queuedConnections = state.queuedConnections;

    const response: {
           connectionId: string,
            remoteAddress: string,
            inQueue: boolean,
        }[] = [];

    sockets.forEach((socket: WrappedSocket) => {
        response.push( {
            connectionId: socket.connectionId,
            remoteAddress: `${socket.socket.remoteAddress}:${socket.socket.remotePort}`,
            inQueue: queuedConnections.has(socket.connectionId),
        });
    });

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: response,
    };
}
