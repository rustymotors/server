import { Socket } from 'node:net';
import { State, addSocket, createInitialState, getSockets, wrapSocket } from '../../shared/State.js';
import { listConnections } from '../src/listConnections';
import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';

let testSave: (state: State ) => void;
let testState: State;
let testSocket: Socket;

describe('listConnections', () => {

    beforeAll(() => {
        testSave = ( state: State ) => {
            testState = state;
        };
        testState = createInitialState({
            saveFunction: testSave,
        });
        testSocket = new Socket();
        testSocket.write = vi.fn().mockImplementation(() => {
            // Do nothing
        });
    });

    beforeEach(() => {
        testState = createInitialState({
            saveFunction: testSave,
        });
    });

    it('returns a JSON response', () => {
        // Arrange
        const id = '1';
        const wrapped = wrapSocket(testSocket, id);

        // Act + Assert

        expect(getSockets(testState)).toHaveLength(0);

        const newState = addSocket(testState, wrapped)

        expect(getSockets(newState)).toHaveLength(1);

        const response = listConnections(newState);

        expect(response.code).toBe(200);
        expect(response.headers).toEqual({ "Content-Type": "application/json" });

        const body = response.body;       
        expect(body).toHaveLength(1);
        expect(body[0].connectionId).toBe(id);
        expect(body[0].remoteAddress).toBe('undefined:undefined');
        expect(body[0].inQueue).toBe(false);
    });
});