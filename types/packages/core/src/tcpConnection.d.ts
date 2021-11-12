/// <reference types="node" />
import { IEncryptionManager, IConnectionManager, EConnectionStatus, ITCPConnection, UnprocessedPacket } from "../../types/src/index";
import { Socket } from "net";
export declare class TCPConnection implements ITCPConnection {
    id: string;
    appId: number;
    status: EConnectionStatus;
    remoteAddress?: string;
    localPort: number;
    sock: Socket;
    msgEvent: null;
    lastMsg: number;
    useEncryption: boolean;
    private encLobby;
    private enc?;
    isSetupComplete: boolean;
    private mgr?;
    inQueue: boolean;
    encryptedCmd?: Buffer;
    decryptedCmd?: Buffer;
    constructor(connectionId: string, sock: Socket);
    isLobbyKeysetReady(): boolean;
    updateConnectionByAddressAndPort(remoteAddress: string, localPort: number, newConnection: ITCPConnection): Promise<void>;
    setManager(manager: IConnectionManager): void;
    setEncryptionManager(encryptionManager: IEncryptionManager): void;
    getEncryptionId(): string;
    encryptBuffer(buffer: Buffer): Buffer;
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
     * DecipherBufferDES
     *
     * @param {Buffer} messageBuffer
     * @return {Buffer}
     */
    decipherBufferDES(messageBuffer: Buffer): Buffer;
    processPacket(packet: UnprocessedPacket): Promise<ITCPConnection>;
}
