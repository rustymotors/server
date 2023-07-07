import { TSMessageBase } from "mcos/shared";
import { TServerLogger } from "mcos/shared/interfaces";
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
export declare class TClientConnectMessage extends TSMessageBase {
    appId: number;
    /**
     * Creates an instance of ClientConnectMessage.
     * @param {TServerLogger} log
     */
    constructor(log: TServerLogger);
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
