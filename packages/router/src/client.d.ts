export class RoutingMesh {
    /** @type {RoutingMesh} */
    static getInstance(): RoutingMesh;
    /**
     *
     * @param {EServerConnectionName} service
     * @param {string} host
     * @param {number} port
     */
    registerServiceWithRouter(service: any, host: string, port: number): void;
    /**
     * @private
     * @param {EServerConnectionName} service
     * @param {Buffer} inputBuffer
     */
    private _sendToRouter;
}
