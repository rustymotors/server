/**
 * @module mcos-gateway
 */

/**
 * @typedef {object} TConnectionList
 * @property {number} code
 * @property {OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined} headers
 * @property {string} body;
 */

/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {TConnectionList}
 */
export function listConnections(connections) {
    /**
     * @type {Array<Partial<TConnection>>}
     */
    let response = [];
    connections.forEach((connection) => {
        response.push({
            id: connection.id,
            remoteAddress: `${connection.socket.remoteAddress}:${connection.localPort}`,
            inQueue: connection.inQueue,
        });
    });

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
    };
}
