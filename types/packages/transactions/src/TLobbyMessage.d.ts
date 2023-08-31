import { GameMessage, Logger, JSONResponseOfGameMessage } from "../../interfaces/index.js";
import { TSMessageBase, BinaryStructure } from "../../shared/index.js";
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
export declare class TLobbyMessage extends TSMessageBase implements GameMessage {
    /**
     * Creates an instance of TLobbyMessage.
     * @param {Logger} log
     * @memberof TLobbyMessage
     */
    constructor(log: Logger);
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
    toJSON(): JSONResponseOfGameMessage;
}
export declare class LobbyInfo extends BinaryStructure {
    /**
     * Creates an instance of LobbyInfo.
     * @author Drazi Crendraven
     * @param {Logger} log
     */
    constructor(log: Logger);
}
//# sourceMappingURL=TLobbyMessage.d.ts.map