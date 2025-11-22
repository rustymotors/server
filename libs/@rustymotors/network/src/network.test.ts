import { describe, it, expect } from 'vitest';
import { ClientConnection, newConnection } from './network.js';
import { Socket as SocketTCP } from 'node:net';
import { createSocket } from 'node:dgram';

describe('ClientConnection', () => {
    it('should initialize with TCP socket', () => {
        const socket = new SocketTCP();
        const connection = new ClientConnection(socket, 'TCP');
        expect(connection).toBeInstanceOf(ClientConnection);
        expect(connection.protocol).toBe('TCP');
        expect(connection.socket).toBe(socket);
        expect(connection.encryptionSetup).toBe(false);
        expect(connection.encryption).toBeNull();
    });

    it('should initialize with UDP socket', () => {
        const socket = createSocket('udp4');
        const connection = new ClientConnection(socket, 'UDP');
        expect(connection).toBeInstanceOf(ClientConnection);
        expect(connection.protocol).toBe('UDP');
        expect(connection.socket).toBe(socket);
    });
});

describe('newConnection', () => {
    it('should create ClientConnection for TCP socket', () => {
        const socket = new SocketTCP();
        const connection = newConnection(socket);
        expect(connection).toBeInstanceOf(ClientConnection);
        expect(connection.protocol).toBe('TCP');
    });

    it('should create ClientConnection for UDP socket', () => {
        const socket = createSocket('udp4');
        const connection = newConnection(socket);
        expect(connection).toBeInstanceOf(ClientConnection);
        expect(connection.protocol).toBe('UDP');
    });
});
