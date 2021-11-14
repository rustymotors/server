export class RoutingServer {
    /** @type {RoutingServer} */
    static _instance: RoutingServer;
    /**
     *
     * @returns {RoutingServer}
     */
    static getInstance(): RoutingServer;
    /**
     * @private
     * @type {import("./types").ServerConnectionRecord[]}
     */
    private _serverConnections;
    /**
     *
     * @param {import("./types").ServerConnectionRecord} payloadJSON
     * @returns {void}
     */
    registerNewService(payloadJSON: import("./types").ServerConnectionRecord): void;
    /**
     *
     * @param {Buffer} data
     * @returns {void}
     */
    handleData(data: Buffer): void;
    start(): void;
}
import { RoutingMesh } from "./client.js";
export { RoutingMesh };
