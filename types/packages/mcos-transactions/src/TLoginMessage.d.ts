import { TSMessageBase } from "mcos/shared";
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
export declare class TLoginMessage extends TSMessageBase {
    appId: number;
    /**
     * Creates an instance of TLoginMessage.
     * @param {TServerLogger} log
     * @memberof TLoginMessage
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
