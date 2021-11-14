/// <reference types="node" />
export class TCPConnection {
    /**
     *
     * @param {string} connectionId
     * @param {import("net").Socket} sock
     */
    constructor(connectionId: string, sock: import("net").Socket);
    /** @type {string} */
    id: string;
    /** @type {number} */
    appId: number;
    /** @type {EConnectionStatus} */
    status: EConnectionStatus;
    /** @type {string | undefined} */
    remoteAddress: string | undefined;
    /** @type {number} */
    localPort: number;
    /** @type {import("net").Socket} */
    sock: import("net").Socket;
    msgEvent: any;
    /** @type {number} */
    lastMsg: number;
    /** @type {boolean} */
    useEncryption: boolean;
    /**
     * @private
     * @type {import("./types").LobbyCiphers}
     */
    private encLobby;
    /**
     * @private
     * @type {import("./encryption-mgr").EncryptionManager | undefined}
     */
    private enc;
    /** @type {boolean} */
    isSetupComplete: boolean;
    /** @type {boolean} */
    inQueue: boolean;
    /**
     * @type {Buffer | undefined}
     */
    encryptedCmd: Buffer | undefined;
    /** @type {Buffer | undefined} */
    decryptedCmd: Buffer | undefined;
    /**
     *
     * @returns {boolean}
     */
    isLobbyKeysetReady(): boolean;
    /**
     *
     * @param {import("./encryption-mgr").EncryptionManager} encryptionManager
     */
    setEncryptionManager(encryptionManager: import("./encryption-mgr").EncryptionManager): void;
    /**
     *
     * @returns {string}
     */
    getEncryptionId(): string;
    /**
     *
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    encryptBuffer(buffer: Buffer): Buffer;
    /**
     *
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    decryptBuffer(buffer: Buffer): Buffer;
    /**
     *
     * @param {Buffer} key
     */
    setEncryptionKey(key: Buffer): void;
    /**
     * @param {string} skey
     */
    setEncryptionKeyDES(skey: string): void;
    /**
     * CipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    cipherBufferDES(messageBuffer: Buffer): Buffer;
    /**
     * DecipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    decipherBufferDES(messageBuffer: Buffer): Buffer;
    /**
     *
     * @param {import("../../transactions/src/types").UnprocessedPacket} packet
     * @param {import("./connection-mgr").ConnectionManager} connectionManager
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<TCPConnection>}
     */
    processPacket(packet: import("../../transactions/src/types").UnprocessedPacket, connectionManager: import("./connection-mgr").ConnectionManager, loginServer: import("../../login/src/index").LoginServer, personaServer: import("../../persona/src/index").PersonaServer, lobbyServer: import("../../lobby/src/index").LobbyServer, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<TCPConnection>;
}
import { EConnectionStatus } from "./types.js";
import { Buffer } from "buffer";
