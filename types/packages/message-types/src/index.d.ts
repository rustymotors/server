/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
export function premadeLogin(): Buffer;
export { GenericReplyMessage } from "./genericReplyMessage";
export { GenericRequestMessage } from "./genericRequestMessage";
export { StockCar } from "./stockCar";
export { LobbyInfoPacket } from "./lobbyInfo";
export interface INPSMessageJSON {
    msgNo: number;
    opCode: number | undefined;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: any;
    sessionkey: string | undefined;
    rawBuffer: string;
}
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
export class NPSMessage {
    /**
     *
     * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
     */
    constructor(direction: any);
    msgNo: number;
    msgVersion: number;
    reserved: number;
    content: Buffer;
    msgLength: number;
    direction: any;
    serviceName: string;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    setContent(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer(): Buffer;
    /**
     *
     * @return {string}
     */
    getPacketAsString(): string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {Buffer} packet
     * @return {NPSMsg}
     * @memberof NPSMsg
     */
    deserialize(packet: Buffer): NPSMessage;
    /**
     *
     * @param {string} messageType
     * @return {void}
     */
    dumpPacketHeader(messageType: string): string;
    /**
     * DumpPacket
     * @return {void}
     * @memberof NPSMsg
     */
    dumpPacket(): string;
    /**
     *
     * @return {INPSMsgJSON}
     */
    toJSON(): INPSMessageJSON;
}
/**
 * @module LoginMsg
 */
/**
 * @class
 * @property {number} newMsgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} customerId
 * @property {number} personaId
 * @property {number} lotOwnerId
 * @property {number} brandedPartId
 * @property {number} skinId
 * @property {string} personaName
 * @property {string} version
 * @property {Buffer} data
 * @property {Record<string, unknown>} struct
 */
export class LoginMessage {
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer);
    msgNo: number;
    toFrom: number;
    appId: number;
    customerId: number;
    personaId: number;
    lotOwnerId: number;
    brandedPartId: number;
    skinId: number;
    personaName: string;
    version: string;
    data: Buffer;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): string;
}
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
    lobbyList: any;
    dataLength: number;
    data: Buffer;
    serviceName: string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): string;
}
/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */
/**
 * @class
 * @property {MESSAGE_DIRECTION} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 */
export class MessageNode {
    /**
     *
     * @param {MESSAGE_DIRECTION} direction
     */
    constructor(direction: any);
    direction: any;
    msgNo: number;
    seq: number;
    flags: number;
    data: Buffer;
    dataLength: number;
    mcoSig: string;
    toFrom: number;
    appId: number;
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    deserialize(packet: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {number} appId
     * @return {void}
     */
    setAppId(appId: number): void;
    /**
     *
     * @param {number} newMsgNo
     * @return {void}
     */
    setMsgNo(newMessageNo: number): void;
    /**
     *
     * @param {number} newSeq
     * @return {void}
     */
    setSeq(newSeq: number): void;
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    setMsgHeader(packet: Buffer): void;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    updateBuffer(buffer: Buffer): void;
    /**
     *
     * @return {boolean}
     */
    isMCOTS(): boolean;
    /**
     *
     * @return {void}
     */
    dumpPacket(): string;
    /**
     *
     * @return {number}
     */
    getLength(): number;
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    BaseMsgHeader(packet: Buffer): void;
}
/**
 * @module ClientConnectMsg
 */
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
export class ClientConnectMessage {
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer);
    msgNo: number;
    personaId: number;
    appId: number;
    customerId: number;
    custName: string;
    personaName: string;
    mcVersion: Buffer;
    /**
     *
     * @return {number}
     */
    getAppId(): number;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): string;
}
/**
 * @typedef InpsPersonaMapsPersonaRecord
 * @property {number} personaCount - uint16
 * @property {number} unknown1 - uint16
 * @property {number} maxPersonas - uint16
 * @property {number} unknown2 - uint16
 * @property {number} id - uint32
 * @property {number} shardId - uint32
 * @property {number} unknown3 - uint16
 * @property {number} unknown4 - uint16
 * @property {number} personaNameLength - uint16
 * @property {string} name - string(16)
 */
/**
 * @typedef InpsPersonaMapsMsgSchema
 * @property {number} msgNo - uint16
 * @property {number} msgLength - uint16
 * @property {number} msgVersion - uint16
 * @property {number} reserved - uint16
 * @property {number} msgChecksum - uint16
 * @property {InpsPersonaMapsPersonaRecord[]} personas
 */
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
    personas: PersonaRecord[];
    personaSize: number;
    personaCount: number;
    /**
     *
     * @param {IPersonaRecord[]} personas
     * @return {void}
     */
    loadMaps(personas: PersonaRecord[]): void;
    /**
     *
     * @param {Buffer} buf
     * @return {number}
     * @memberof! NPSPersonaMapsMsg
     */
    deserializeInt8(buf: Buffer): number;
    /**
     *
     * @param {Buffer} buf
     * @return {number}
     * @memberof! NPSPersonaMapsMsg
     */
    deserializeInt32(buf: Buffer): number;
    /**
     *
     * @param {Buffer} buf
     * @return {string}
     * @memberof! NPSPersonaMapsMsg
     */
    deserializeString(buf: Buffer): string;
}
/**
 *
 * @class
 * @extends {NPSMsg}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus {
    /**
     *
     * @param {Buffer} packet
     */
    constructor(packet: Buffer);
    sessionkey: string;
    opCode: number;
    contextId: string;
    buffer: Buffer;
    /**
     * Load the RSA private key
     *
     * @param {string} privateKeyPath
     * @return {string}
     */
    fetchPrivateKeyFromFile(privateKeyPath: string): string;
    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     * @param {IServerConfig} serverConfig
     * @param {Buffer} packet
     * @return {void}
     */
    extractSessionKeyFromPacket(serverConfig: AppConfiguration["certificate"], packet: Buffer): void;
    /**
     *
     * @return {module:NPSMsg.INPSMsgJSON}
     */
    override toJSON(): INPSMessageJSON;
    /**
     * @return {void}
     */
    override dumpPacket(): string;
}
/**
 * @class
 * @extends {NPSMsg}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo {
    /**
     *
     * @param {MESSAGE_DIRECTION} direction
     */
    constructor(direction: any);
    userId: number;
    userName: Buffer;
    userData: Buffer;
    serviceName: string;
    /**
     *
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    override deserialize(rawData: Buffer): NPSUserInfo;
    /**
     * @return {void}
     */
    dumpInfo(): string;
}
export type INPSMsgJSON = {
    msgNo: number;
    opCode: number | null;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: any;
    sessionkey: string | null;
    rawBuffer: string;
};
export type InpsPersonaMapsPersonaRecord = {
    /**
     * - uint16
     */
    personaCount: number;
    /**
     * - uint16
     */
    unknown1: number;
    /**
     * - uint16
     */
    maxPersonas: number;
    /**
     * - uint16
     */
    unknown2: number;
    /**
     * - uint32
     */
    id: number;
    /**
     * - uint32
     */
    shardId: number;
    /**
     * - uint16
     */
    unknown3: number;
    /**
     * - uint16
     */
    unknown4: number;
    /**
     * - uint16
     */
    personaNameLength: number;
    /**
     * - string(16)
     */
    name: string;
};
export type InpsPersonaMapsMsgSchema = {
    /**
     * - uint16
     */
    msgNo: number;
    /**
     * - uint16
     */
    msgLength: number;
    /**
     * - uint16
     */
    msgVersion: number;
    /**
     * - uint16
     */
    reserved: number;
    /**
     * - uint16
     */
    msgChecksum: number;
    personas: InpsPersonaMapsPersonaRecord[];
};
import { AppConfiguration } from "../../config/src/index";
