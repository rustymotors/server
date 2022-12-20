import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import { NPSMessage } from "../NPSMessage.js";

export declare type EncryptionSession = {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    shortKey: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
};
/**
 * Socket with connection properties
 */
export declare type SocketWithConnectionInfo = {
    socket: Socket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
};
export declare type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};

export interface GSMessageArrayWithConnection {
    connection: SocketWithConnectionInfo;
    messages: NPSMessage[];
}

/**
 * @private
 * @return {NPSMessage}}
 */
export async function _npsHeartbeat(
    dataConnection: BufferWithConnection
): Promise<GSMessageArrayWithConnection> {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_27;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    return {
        connection: dataConnection.connection,
        messages: [packetResult],
    };
}
