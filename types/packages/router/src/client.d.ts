export class RoutingMesh {
    /** @return {RoutingMesh} */
    static getInstance(): RoutingMesh;
    /**
     *
     * @param {import("./types").EServerConnectionService} service
     * @param {string} host
     * @param {number} port
     */
    registerServiceWithRouter(service: import("./types").EServerConnectionService, host: string, port: number): void;
    /**
     * @private
     * @param {import("./types").EServerConnectionService} service
     * @param {Buffer} inputBuffer
     */
    private _sendToRouter;
}
