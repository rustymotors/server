export { getAllConnections } from "./connections.js";
export { AdminServer } from "./adminServer.js";
/**
 * A server
 *
 * Please use {@link MCOServer.start()}
 * @classdesc
 * @export
 * @class MCOServer
 */
export class MCOServer {
    /**
     * Launch the server
     *
     * @static
     * @return {void}
     * @memberof MCOServer
     */
    static start(): void;
    /**
     *
     * @private
     * @type {import("node:net").Server[]}
     * @memberof MCOServer
     */
    private _listeningServers;
    /**
     * Handle incomming socket connections
     *
     * @private
     * @param {import("node:net").Socket} incomingSocket
     * @return {void}
     * @memberof MCOServer
     */
    private _listener;
    /**
     * Start port listeners
     *
     * @return {void}
     * @memberof MCOServer
     */
    run(): void;
    /**
     * Close all listening ports and move server to stopped state
     *
     * @return {void}
     * @memberof MCOServer
     */
    stop(): void;
}
//# sourceMappingURL=index.d.ts.map