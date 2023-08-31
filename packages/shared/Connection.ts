import { randomUUID } from "node:crypto";
import { ClientConnection, NetworkSocket, EncryptionSession } from "../interfaces/index.js";

export class Connection implements ClientConnection {
    /**
     * @memberof Connection
     */
    static INACTIVE = 0;

    /**
     * @memberof Connection
     */
    static ACTIVE = 1;

    /**
     * @memberof Connection
     */
    static CLOSE_PENDING = 2;

    /**
     * @memberof Connection
     */
    static SOFT_KILL = 3;
    id: string;
    appID: number;
    status: number;
    socket: NetworkSocket | null = null;
    remoteAddress: string;
    seq: number;
    personaId: number;
    lastMessageTimestamp: number;
    port: number;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
    ip: string | null = null;
    inQueue: boolean;

    constructor() {
        this.id = randomUUID();
        this.appID = 0;
        this.status = Connection.INACTIVE;
        this.socket = null;
        this.port = 0;
        this.useEncryption = false;
        this.ip = null;
        this.inQueue = false;
        this.remoteAddress = "";
        this.seq = 0;
        this.personaId = 0;
        this.lastMessageTimestamp = 0;
    }
}
