/// <reference types="node" />
import { LobbyInfoPacket } from './lobby-info';
/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
export declare class LobbyMessage {
    msgNo: number;
    noLobbies: number;
    moreToCome: number;
    lobbyList: LobbyInfoPacket;
    dataLength: number;
    data: Buffer;
    serviceName: string;
    /**
     *
     */
    constructor();
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void;
}
