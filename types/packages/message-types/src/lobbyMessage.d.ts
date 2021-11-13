/// <reference types="node" />
/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
export class LobbyMessage {
    msgNo: number;
    noLobbies: number;
    moreToCome: number;
    lobbyList: LobbyInfoPacket;
    dataLength: 572;
    data: Buffer;
    serviceName: string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
import { LobbyInfoPacket } from "./lobbyInfo";
import { Buffer } from "buffer";
