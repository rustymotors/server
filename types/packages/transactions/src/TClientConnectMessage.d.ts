import { Logger } from "pino";
import { TransactionMessageBase } from "../../shared/TMessageBase.js";
/**
 *
 *
 * @class TClientConnectMessage
 * @extends {TSMessageBase}
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export declare class TClientConnectMessage extends TransactionMessageBase {
    appId: number;
    /**
     * Creates an instance of ClientConnectMessage.
     * @param {Logger} log
     */
    constructor(log: Logger);
    /**
     *
     * @return {number}
     */
    getAppId(): number;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
//# sourceMappingURL=TClientConnectMessage.d.ts.map