import type { Socket as SocketUDP } from 'node:dgram';
import type { Socket as SocketTCP } from 'node:net';
import { Cipheriv, Decipheriv } from 'node:crypto';
import type EventEmitter from 'node:events';

export type ProtocolTCP = {
    protocol: 'TCP';
    ip: string;
    port: number;
    socket: SocketTCP;
};

export type ProtocolUDP = {
    protocol: 'UDP';
    ip: string;
    port: number;
    socket: SocketUDP;
};

type EncryptionSetupNo = {
    encryptionSetup: false;
    encryption: null;
};

type EncryptionPairDES = {
    cmdEnc: Cipheriv;
    cmdDec: Decipheriv;
};

type EncryptionPairRC4 = {
    cmdEnc: Cipheriv;
    cmdDec: Decipheriv;
};

type EncryptionSetupYes = {
    encryptionSetup: false;
    encryption: EncryptionPairDES & EncryptionPairRC4;
};

export type IClientConnection = {
    personaName: string;
    personaId: number;
} & (ProtocolTCP | ProtocolUDP) &
    (EncryptionSetupNo | EncryptionSetupYes) &
    Pick<EventEmitter, "emit" | "on">;


