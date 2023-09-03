import { Logger } from "pino";
import { GameMessage, JSONResponseOfGameMessage } from "../../interfaces/index.js";
import { TransactionMessageBase } from "../../shared/TMessageBase.js";
import { BinaryStructureBase } from "../../shared/BinaryStructure.js";
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
export declare class TLobbyMessage extends TransactionMessageBase implements GameMessage {
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
export declare class LobbyInfo extends BinaryStructureBase {
    /**
     * Creates an instance of LobbyInfo.
     * @author Drazi Crendraven
     * @param {Logger} log
     */
    constructor(log: Logger);
}
//# sourceMappingURL=TLobbyMessage.d.ts.map