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
export class TClientConnectMessage extends TSMessageBase {
    appId: number;
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
import { TSMessageBase } from "../structures/MessageBase.js";
//# sourceMappingURL=TClientConnectMessage.d.ts.map