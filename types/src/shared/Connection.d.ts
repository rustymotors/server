import { IConnection, ISocket, TEncryptionSession } from "./interfaces.js";
export declare class Connection implements IConnection {
    /**
     * @memberof Connection
     */
    static INACTIVE: number;
    /**
     * @memberof Connection
     */
    static ACTIVE: number;
    /**
     * @memberof Connection
     */
    static CLOSE_PENDING: number;
    /**
     * @memberof Connection
     */
    static SOFT_KILL: number;
    id: string;
    appID: number;
    status: number;
    socket: ISocket | null;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    port: number;
    useEncryption: boolean;
    encryptionSession?: TEncryptionSession;
    ip: string | null;
    inQueue: boolean;
    constructor();
}
