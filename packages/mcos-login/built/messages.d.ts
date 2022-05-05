/**
 * @export
 * @typedef {object} MCOTSListEntry
 * @property {number} mcotsID - 4 bytes. shard-wide unique id # of this MCOTS instance
 * @property {number} port - 2 bytes
 * @property {string} ip - 4 bytes
 * @property {number} priorityOrder - 2 bytes. lower means has less load
 */
/**
 * @export
 * @typedef {[MCOTSListEntry, MCOTSListEntry, MCOTSListEntry, MCOTSListEntry]} MCOTSServerList
 */
export class GLoginMsg extends GSMessageBase {
    msgNo: number;
    customerId: number;
    personaId: number;
    lotOwnerId: number;
    brandedPartId: number;
    skinId: number;
    personaName: string;
    mcVersion: number;
}
export class LoginCompleteMsg {
    msgNo: number;
    serverTime: number;
    firstTime: boolean;
    paycheckWaiting: boolean;
    clubInvantationsWaiting: boolean;
    tallyInProgress: boolean;
    secondsTillShutdown: number;
    shardGNP: number;
    shardCarsSold: number;
    shardAverageSalary: number;
    shardAverageCarsSold: number;
    shardAveragePlayerLevel: number;
    /** @type {MCOTSListEntry[]} - max_siz: 4 */
    ServerList: MCOTSListEntry[];
    /**
       * used by GPS web page to provide some minimal validation of the user;
       *   o created by MCOTS; stored into DB at login time
       *   o submitted by client in web page posts
       *   o java compares this value against PLAYER.WEBCOOKIE
       */
    webCookie: string;
    /** @type {import("mcos-shared/structures").TIMESTAMP_STRUCT} */
    nextTallyDate: import("mcos-shared/structures").TIMESTAMP_STRUCT;
    /** @type {import("mcos-shared/structures").TIMESTAMP_STRUCT} */
    nextPaycheckDate: import("mcos-shared/structures").TIMESTAMP_STRUCT;
}
export type MCOTSListEntry = {
    /**
     * - 4 bytes. shard-wide unique id # of this MCOTS instance
     */
    mcotsID: number;
    /**
     * - 2 bytes
     */
    port: number;
    /**
     * - 4 bytes
     */
    ip: string;
    /**
     * - 2 bytes. lower means has less load
     */
    priorityOrder: number;
};
export type MCOTSServerList = [MCOTSListEntry, MCOTSListEntry, MCOTSListEntry, MCOTSListEntry];
import { GSMessageBase } from "mcos-shared/structures";
//# sourceMappingURL=messages.d.ts.map