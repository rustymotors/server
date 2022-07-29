/// <reference types="node" />
export declare enum ECONNECTION_STATUS {
    'Active' = "Active",
    'Inactive' = "Inactive"
}
/**
 * Container for all TCP connections
 */
export declare class TCPConnection {
    /**
     *
     *
     * @type {string}
     * @memberof TCPConnection
     */
    id: string;
    /**
     *
     *
     * @type {number}
     * @memberof TCPConnection
     */
    appId: number;
    /**
     *
     *
     * @type {EConnectionStatus}
     * @memberof TCPConnection
     */
    status: ECONNECTION_STATUS;
    /**
     *
     * @type {string} [remoteAddress]
     * @memberof TCPConnection
     */
    remoteAddress: string;
    /**
     *
     *
     * @type {number}
     * @memberof TCPConnection
     */
    localPort: number;
    /**
     *
     *
     * @type {import("node:net").Socket}
     * @memberof TCPConnection
     */
    sock: import("node:net").Socket;
    /**
     *
     *
     * @type {null}
     * @memberof TCPConnection
     */
    msgEvent: null;
    /**
     *
     *
     * @type {number}
     * @memberof TCPConnection
     */
    lastMsg: number;
    /**
     *
     *
     * @type {boolean}
     * @memberof TCPConnection
     */
    useEncryption: boolean;
    /**
     *
     *
     * @private
     * @type {import("./types").LobbyCiphers}
     * @memberof TCPConnection
     */
    encLobby: import("./types").LobbyCiphers;
    /**
     *
     *
     * @private
     * @type {import(".").EncryptionManager | undefined} [enc]
     * @memberof TCPConnection
     */
    enc: import(".").EncryptionManager | undefined;
    /**
     *
     *
     * @type {boolean}
     * @memberof TCPConnection
     */
    isSetupComplete: boolean;
    /**
     *
     *
     * @type {boolean}
     * @memberof TCPConnection
     */
    inQueue: boolean;
    /**
     *
     *
     * @type {Buffer | undefined} [encryptedCmd]
     * @memberof TCPConnection
     */
    encryptedCmd: Buffer | undefined;
    /**
     *
     *
     * @type {Buffer | undefined} [decryptedCmd]
     * @memberof TCPConnection
     */
    decryptedCmd: Buffer | undefined;
    /**
     * Creates an instance of TCPConnection.
     * @param {string} connectionId
     * @param {import("node:net").Socket} sock
     * @memberof TCPConnection
     */
    constructor(connectionId: string, sock: import("node:net").Socket);
    /**
     * Has the encryption keyset for lobby messages been created?
     * @returns {boolean}
     */
    isLobbyKeysetReady(): boolean;
    /**
     * Set the encryption manager
     * @param {import(".").EncryptionManager} encryptionManager
     * @returns {TCPConnection}
     */
    setEncryptionManager(encryptionManager: import(".").EncryptionManager): TCPConnection;
    /**
     * Return the encryption manager id
     * @returns {string}
     */
    getEncryptionId(): string;
    /**
     * Encrypt the buffer contents
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    encryptBuffer(buffer: Buffer): Buffer;
    /**
     * Decrypt the buffer contents
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    decryptBuffer(buffer: Buffer): Buffer;
    /**
     *
     * @param {Buffer} key
     * @return {void}
     */
    setEncryptionKey(key: Buffer): void;
    /**
     * SetEncryptionKeyDES
     *
     * @param {string} skey
     * @return {void}
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
     * Decrypt a command that is encrypted with DES
     * @param {Buffer} messageBuffer
     */
    decipherBufferDES(messageBuffer: Buffer): Buffer;
    /**
     *
     * @param {import("./types").MessageNode} packet
     * @returns {{connection: TCPConnection, packet: import("./types").MessageNode, lastError?: string}}
     */
    compressIfNeeded(packet: import("./types").MessageNode): {
        connection: TCPConnection;
        packet: import("./types").MessageNode;
        lastError?: string;
    };
    /**
     *
     * @param {import("./types").MessageNode} packet
     * @returns {{connection: TCPConnection, packet: import("./types").MessageNode}}
     */
    encryptIfNeeded(packet: import("./types").MessageNode): {
        connection: TCPConnection;
        packet: import("./types").MessageNode;
    };
    /**
     * Attempt to write packet(s) to the socjet
     * @param {import("./types").MessageNode[]} packetList
     * @returns {TCPConnection}
     */
    tryWritePackets(packetList: Array<import("./types").MessageNode>): TCPConnection;
}
