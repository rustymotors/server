// @ts-nocheck
import { Socket as SocketUDP, type RemoteInfo } from 'node:dgram';
import EventEmitter from 'node:events';
import { Socket as SocketTCP, type AddressInfo } from 'node:net';
import type { IClientConnection } from './types.js';
import type { Cipheriv, Decipheriv } from 'crypto';

export class ClientConnection
    extends EventEmitter
    implements IClientConnection
{
    personaName: string = '';
    personaId: number = 0;
    ip: string;
    port: number;
    protocol: 'TCP' | 'UDP';
    socket: SocketTCP | SocketUDP;
    encryptionSetup: false;
    encryption:
        | ({ cmdEnc: Cipheriv; cmdDec: Decipheriv } & {
              cmdEnc: Cipheriv;
              cmdDec: Decipheriv;
          })
        | null;

    constructor(socket: SocketTCP | SocketUDP) {
        super();
        const remoteAddress = socket.remoteAddress;
        const localPort = (socket.address() as AddressInfo).port;

        if (
            typeof remoteAddress === 'undefined' ||
            typeof localPort === 'undefined'
        ) {
            throw new Error('both remoteAddress and localPort must be defined');
        }
    }
}

export function newConnection(socket: SocketTCP | SocketUDP): ClientConnection;

export function newConnection(socket: SocketTCP | SocketUDP): ClientConnection {
    if (socket instanceof SocketTCP) {
        const connection: ClientConnection = {
            personaName: '',
            personaId: 0,
            ip: remoteAddress,
            port: localPort,
            protocol: 'TCP',
            socket: socket,
            encryptionSetup: false,
            encryption: null,
        };
    } else if (socket instanceof SocketUDP) {
    } else {
        throw new Error('socket is not either TCP or UDP');
    }
}
