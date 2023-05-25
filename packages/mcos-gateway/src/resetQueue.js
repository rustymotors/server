/**
 * @module mcos-gateway
 */

// https://careerkarma.com/blog/converting-circular-structure-to-json/
export function replacerFunc() {
    const visited = new WeakSet();
    return (/** @type {string} */ _key, /** @type {object} */ value) => {
        if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
        }
        return value;
    };
}

/**
 *
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {TJSONResponse}
 */
export function resetQueue(connections) {
    const resetConnections = connections.map((c) => {
        c.inQueue = true;
        return c;
    });
    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetConnections, replacerFunc()),
    };
}
