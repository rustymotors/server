import { Socket as SocketUDP } from 'node:dgram';
import EventEmitter from 'node:events';
import { Socket as SocketTCP } from 'node:net';
import type { Cipheriv, Decipheriv } from 'crypto';


export class ClientConnection
    extends EventEmitter
{
    personaName: string = '';
    personaId: number = 0;
    ip: string;
    port: number;
    protocol: 'TCP' | 'UDP';
    socket: SocketTCP | SocketUDP;
    encryptionSetup: false = false;
    encryption:
        | ({ cmdEnc: Cipheriv; cmdDec: Decipheriv } & {
              cmdEnc: Cipheriv;
              cmdDec: Decipheriv;
          })
        | null = null;

    constructor(socket: SocketTCP | SocketUDP, protocol: 'TCP' | 'UDP') {
        super();
        this.socket = socket;
        this.protocol = protocol;

        if (protocol === 'TCP' && socket instanceof SocketTCP) {
            this.ip = socket.remoteAddress || '';
            this.port = socket.localPort || 0;
        } else if (protocol === 'UDP' && socket instanceof SocketUDP) {
             // UDP sockets don't have a single remote address/port in the same way, 
             // but for a connected UDP socket or just initialization we might need to handle it differently.
             // For now, initializing with defaults or extracting from address() if possible.
             try {
                const address = socket.address();
                this.ip = address.address;
                this.port = address.port;
             } catch (e) {
                 // Socket might not be bound yet
                 this.ip = '';
                 this.port = 0;
             }
        } else {
             this.ip = '';
             this.port = 0;
        }
    }
}

export function newConnection(socket: SocketTCP | SocketUDP): ClientConnection {
    if (socket instanceof SocketTCP) {
        return new ClientConnection(socket, 'TCP');
    } else if (socket instanceof SocketUDP) {
        return new ClientConnection(socket, 'UDP');
    } else {
        throw new Error('socket is not either TCP or UDP');
    }
}
