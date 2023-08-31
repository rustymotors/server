import { ClientConnection, NetworkSocket, EncryptionSession } from "../interfaces/index.js";
export declare class Connection implements ClientConnection {
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
    socket: NetworkSocket | null;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    port: number;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
    ip: string | null;
    inQueue: boolean;
    constructor();
}
//# sourceMappingURL=Connection.d.ts.map