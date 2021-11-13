/// <reference types="node" />
export namespace CastanetResponse {
    const body: Buffer;
    namespace header {
        const type: string;
        const value: string;
    }
}
export class PatchServer {
    /** @type {PatchServer} */
    static _instance: PatchServer;
    /**
     *
     * @returns {PatchServer}
     */
    static getInstance(): PatchServer;
    start(): void;
    /**
     *
     * @param {IncomingMessage} request
     * @param {ServerResponse} response
     */
    handleRequest(request: any, response: any): void;
}
import { Buffer } from "buffer";
