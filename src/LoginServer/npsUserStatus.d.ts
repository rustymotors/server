/// <reference types="node" />
import { Socket } from "net";
import { IConfigurationFile } from "../../config/config";
/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @returns {LoginPacket}
 */
export declare class NPSUserStatus {
    opCode: number;
    contextId: string;
    sessionKey: string;
    private buffer;
    constructor(socket: Socket, packet: Buffer);
    /**
     * extractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     */
    extractSessionKeyFromPacket(serverConfig: IConfigurationFile["serverConfig"], packet: Buffer): string;
}
