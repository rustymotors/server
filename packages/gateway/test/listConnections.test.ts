import { SocketWithConnectionInfo } from '../../interfaces/index.js';
import { listConnections } from '../src/listConnections';
import { describe, it, expect } from 'vitest';
import { ISocketTestFactory } from '../../shared/index.js';

describe('listConnections', () => {
    it('returns a JSON response', () => {
        const connections: SocketWithConnectionInfo[] = [
            {
                connectionId: '1',
                seq: 0,
                id: '1',
                remoteAddress: '',
                socket: ISocketTestFactory(),
                localPort: 1,
                inQueue: false,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false
                
            },
            {
                connectionId: '2',
                seq: 0,
                id: '2',
                socket: ISocketTestFactory(),
                remoteAddress: '',
                localPort: 2,
                inQueue: true,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false
            }
        ];
        const response = listConnections(connections);
        expect(response.code).toBe(200);
        expect(response.headers).toEqual({ "Content-Type": "application/json" });
        expect(response.body).toBe(JSON.stringify([
            {
                connectionId: '1',
                remoteAddress: ':1',
                inQueue: false
            },
            {
                connectionId: '2',
                remoteAddress: ':2',
                inQueue: true
            }
        ]));
    });
});