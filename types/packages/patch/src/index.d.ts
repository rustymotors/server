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
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request: import("http").IncomingMessage, response: import("http").ServerResponse): void;
}
import { Buffer } from "buffer";
