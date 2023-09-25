import {
    getQueuedConnections,
    getSocket,
    removeQueuedConnection,
} from "../../shared/State.js";



/**
 * Release a connection from the queue
 *
 * @param {object} args
 * @param {module:State} args.state The state object
 * @param {string} args.connectionId The ID of the connection to release
 * @returns A JSON response
 */
export function releaseQueue({ state, connectionId }) {
    const success = getQueuedConnections(state).includes(connectionId);

    if (!success) {
        return {
            code: 422,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "connection not queued" }),
        };
    }

    const connection = getSocket(state, connectionId);

    if (typeof connection === "undefined") {
        return {
            code: 422,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "connection not found" }),
        };
    }

    removeQueuedConnection(state, connectionId).save();

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "connection removed from queue" }),
    };
}
