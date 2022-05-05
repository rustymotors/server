/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
export function premadeLogin(): Buffer;
export { TClientConnectMessage } from "./TClientConnectMessage.js";
/**
 * @export
 * @typedef LobbyCiphers
 * @property {import('node:crypto').Cipher} [cipher]
 * @property {import('node:crypto').Decipher} [decipher]
 */
/**
 * @export
 * @typedef SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */
/**
 * @export
 * @typedef PersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */
/**
 * @export
 * @typedef UserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */
/**
 * @export
 * @typedef NpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {'Lobby' | 'Login'} module
 */
/**
 * Commands from the game server to the game client
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBYSERVER_COMMANDS: NpsCommandMap[];
/**
 * Commands from the game client to the game server
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBYCLIENT_COMMANDS: NpsCommandMap[];
/**
 * Commands from the game client to the login server
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOGINCLIENT_COMMANDS: NpsCommandMap[];
/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBY_COMMANDS: NpsCommandMap[];
/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOGIN_COMMANDS: NpsCommandMap[];
/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_COMMANDS: NpsCommandMap[];
/**
 * @export
 * @typedef {'recieved' | 'sent' | 'not set'} EMESSAGE_DIRECTION
 *
 */
/**
 * @class
 */
export class MessageNode {
    /**
     *
     * @param {EMESSAGE_DIRECTION} direction
     */
    constructor(direction: EMESSAGE_DIRECTION);
    /**
     *
     *
     * @type {EMESSAGE_DIRECTION}
     * @memberof MessageNode
     */
    direction: EMESSAGE_DIRECTION;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    msgNo: number;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    seq: number;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    flags: number;
    /**
     *
     *
     * @type {Buffer}
     * @memberof MessageNode
     */
    data: Buffer;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    dataLength: number;
    /**
     *
     *
     * @type {string}
     * @memberof MessageNode
     */
    mcoSig: string;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    toFrom: number;
    /**
     *
     *
     * @type {number}
     * @memberof MessageNode
     */
    appId: number;
    rawPacket: Buffer;
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
     * @param {number} newMessageNo
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
     * @return {string}
     */
    dumpPacket(): string;
    /**
     * Returns a formatted representation of the packet as a string
     * @returns {string}
     */
    toString(): string;
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
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericReplyMessage {
    /**
     * One of
     *
     * * MC_SUCCESS = 101 : Used with GenericReply structure to indicate that the request succeeded
     *
     * * MC_FAILED = 102  : Used with GenericReply structure to indicate that the request failed
     *
     * * MC_GENERIC_REPLY : Used with GenericReply structure for messages that return data
     */
    msgNo: number;
    toFrom: number;
    appId: number;
    msgReply: number;
    result: Buffer;
    data: Buffer;
    data2: Buffer;
    /**
     * Setter data
     * @param {Buffer} value
     * @return {void}
     */
    setData(value: Buffer): void;
    /**
     * Setter data2
     * @param {Buffer} value
     * @return {void}
     */
    setData2(value: Buffer): void;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    setResult(buffer: Buffer): void;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
/**
 * @module GenericRequestMsg
 */
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 * @property {string} serviceName
 */
export class GenericRequestMessage {
    msgNo: number;
    data: Buffer;
    data2: Buffer;
    serviceName: string;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
/**
 * Container objest for Stock cars
 * @module StockCar
 */
/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
export class StockCar {
    /**
     * @param {number} brandedPartId
     * @param {number} retailPrice
     * @param {0|1} bIsDealOfTheDay
     */
    constructor(brandedPartId: number, retailPrice: number, bIsDealOfTheDay: 0 | 1);
    brandedPartId: number;
    retailPrice: number;
    bIsDealOfTheDay: 0 | 1;
    serviceName: string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
/**
 * Object for providing information on stock cars
 * @module StockCarInfoMsg
 */
/**
 * @class
 * @property {number} msgNo
 * @property {number} starterCash
 * @property {number} dealerId
 * @property {number} brand
 * @property {number} noCars
 * @property {number} moreToCome
 * @property {StockCar[]} StockCarList
 */
export class StockCarInfoMessage {
    /**
     * Creates an instance of StockCarInfoMsg.
     * @class
     * @param {number} starterCash
     * @param {number} dealerId
     * @param {number} brand
     * @memberof StockCarInfoMsg
     */
    constructor(starterCash: number, dealerId: number, brand: number);
    msgNo: number;
    starterCash: number;
    dealerId: number;
    brand: number;
    noCars: number;
    moreToCome: number;
    /**
     *
     * @type {StockCar[]}
     * @memberof StockCarInfoMessage
     */
    StockCarList: StockCar[];
    /**
     *
     *
     * @type {string}
     * @memberof StockCarInfoMessage
     */
    serviceName: string;
    /**
     *
     * @param {StockCar} car
     * @return {void}
     */
    addStockCar(car: StockCar): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string} serviceName
 */
export class NPSMessage {
    /**
     *
     * @param {EMESSAGE_DIRECTION} direction - the direction of the message flow
     */
    constructor(direction: EMESSAGE_DIRECTION);
    msgNo: number;
    msgVersion: number;
    reserved: number;
    content: Buffer;
    msgLength: number;
    direction: EMESSAGE_DIRECTION;
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
     * @return {NPSMessage}
     * @memberof NPSMessage
     */
    deserialize(packet: Buffer): NPSMessage;
    /**
     *
     * @param {string} messageType
     * @return {string}
     */
    dumpPacketHeader(messageType: string): string;
    /**
     * DumpPacket
     * @return {string}
     * @memberof NPSMsg
     */
    dumpPacket(): string;
    /**
     *
     * @return {INPSMessageJSON}
     */
    toJSON(): INPSMessageJSON;
}
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
    /**
     *
     * @type {PersonaRecord[]}
     * @memberof NPSPersonaMapsMessage
     */
    personas: PersonaRecord[];
    personaSize: number;
    personaCount: number;
    /**
     *
     * @param {PersonaRecord[]} personas
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
 * @global
 * @typedef {Object} INPSMessageJSON
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string | null } sessionkey
 * @property {string} rawBuffer
 */
/**
 *
 *
 * @export
 * @typedef {object} NPSMessageValues
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string} serviceName
 */
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus extends NPSMessage {
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
     * @param {Buffer} packet
     * @return {void}
     */
    extractSessionKeyFromPacket(packet: Buffer): void;
}
/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
    userId: number;
    userName: Buffer;
    userData: Buffer;
    /**
     *
     * @override
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    override deserialize(rawData: Buffer): NPSUserInfo;
    /**
     * @return {string}
     */
    dumpInfo(): string;
}
export type LobbyCiphers = {
    cipher?: import("crypto").Cipher | undefined;
    decipher?: import("crypto").Decipher | undefined;
};
export type SessionRecord = {
    skey: string;
    sessionkey: string;
};
export type PersonaRecord = {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
};
export type UserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};
export type NpsCommandMap = {
    name: string;
    value: number;
    module: 'Lobby' | 'Login';
};
export type EMESSAGE_DIRECTION = 'recieved' | 'sent' | 'not set';
export type INPSMessageJSON = {
    msgNo: number;
    opCode: number | null;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: EMESSAGE_DIRECTION;
    sessionkey: string | null;
    rawBuffer: string;
};
export type NPSMessageValues = {
    msgNo: number;
    msgVersion: number;
    reserved: number;
    content: Buffer;
    msgLength: number;
    direction: EMESSAGE_DIRECTION;
    serviceName: string;
};
export type ICoreConfig = {
    externalHost: string;
    ports?: number[] | undefined;
};
/**
 * Socket with connection properties
 */
export type SocketWithConnectionInfo = {
    socket: import('node:net').Socket;
    seq: number;
    id: string;
    /**
     * (appId)
     */
    personaId: number;
    lastMsgTimestamp: number;
    inQueue: boolean;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession | undefined;
};
export type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};
export type EncryptionSession = {
    connectionId: string;
    sessionKey: string;
    shortKey: string;
    /**
     * - des-cbc, uses skey
     */
    gsCipher: import('node:crypto').Cipher;
    /**
     * - des-cbc, uses skey
     */
    gsDecipher: import('node:crypto').Decipher;
    /**
     * - rc4, uses sessionkey
     */
    tsCipher: import('node:crypto').Cipher;
    /**
     * - rc4, uses sessionkey
     */
    tsDecipher: import('node:crypto').Decipher;
};
/**
 * N+ messages, ready for sending, with related connection
 */
export type GSMessageArrayWithConnection = {
    connection: SocketWithConnectionInfo;
    messages: NPSMessage[];
};
/**
 * N+ messages, ready for sending, with related connection
 */
export type TSMessageArrayWithConnection = {
    connection: SocketWithConnectionInfo;
    messages: MessageNode[];
};
export type GServiceResponse = {
    err: Error | null;
    response: GSMessageArrayWithConnection | undefined;
};
export type TServiceResponse = {
    err: Error | null;
    response: TSMessageArrayWithConnection | undefined;
};
//# sourceMappingURL=index.d.ts.map