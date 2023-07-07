import { BinaryStructure, TSMessageBase } from "mcos/shared";
import { TServerLogger } from "mcos/shared/interfaces";
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export declare class TLobbyMessage extends TSMessageBase {
    /**
     * Creates an instance of TLobbyMessage.
     * @param {TServerLogger} log
     * @memberof TLobbyMessage
     */
    constructor(log: TServerLogger);
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
export declare class LobbyInfo extends BinaryStructure {
    /**
     * Creates an instance of LobbyInfo.
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     */
    constructor(log: TServerLogger);
}
