import { describe, expect, it, beforeEach } from 'vitest';
import { Room } from '../src/lib/Room.js';
import { RoomServer } from '../src/lib/RoomServer.js';
import { PrimaryRoomServer } from '../src/lib/PrimaryRoomServer.js';
import { User } from '../src/lib/User.js';
import { BytableChannelData } from '@rustymotors/binary';

describe('Room', () => {
    it('stores commId and riff', () => {
        const room = new Room(5, 'MCC05');
        expect(room.commId).toBe(5);
        expect(room.riff).toBe('MCC05');
        expect(room.name).toBe('MCC05');
    });

    it('has default protocol, channelType, maxReadyPlayers of 0', () => {
        const room = new Room(1, 'MCC01');
        expect(room.protocol).toBe(0);
        expect(room.channelType).toBe(0);
        expect(room.maxReadyPlayers).toBe(0);
    });

    it('channelData is a BytableChannelData instance', () => {
        const room = new Room(1, 'MCC01');
        expect(room.channelData).toBeInstanceOf(BytableChannelData);
    });

    it('starts with an empty userList', () => {
        const room = new Room(1, 'MCC01');
        expect(room.userList.size).toBe(0);
    });

    it('addUser adds a user by personaId', () => {
        const room = new Room(1, 'MCC01');
        room.addUser(42, new User(42));
        expect(room.userList.size).toBe(1);
        expect(room.userList.has(42)).toBe(true);
    });

    it('removeUser removes a user by personaId', () => {
        const room = new Room(1, 'MCC01');
        room.addUser(42, new User(42));
        room.removeUser(42);
        expect(room.userList.size).toBe(0);
    });

    it('removeUser is a no-op for unknown personaId', () => {
        const room = new Room(1, 'MCC01');
        expect(() => room.removeUser(999)).not.toThrow();
    });
});

describe('RoomServer', () => {
    let server: RoomServer;

    beforeEach(() => {
        server = new RoomServer(1, 'TestServer', '127.0.0.1', 9000);
    });

    it('getRoomByCommId throws an error for unknown commId', () => {
        expect(() => server.getRoomByCommId(1)).toThrow();
    });

    it('getRoomByCommId finds a room by commId', () => {
        const room = new Room(7, 'MCC07');
        server['_roomList'].set('MCC07', room);
        expect(server.getRoomByCommId(7)).toBe(room);
    });

});

describe('PrimaryRoomServer', () => {
    let primary: PrimaryRoomServer;

    beforeEach(() => {
        primary = new PrimaryRoomServer('127.0.0.1', 9000);
    });

    it('creates 23 rooms (CTRL, LOBBY, MCCHAT + MCC01-MCC20)', () => {
        expect(primary.roomList).toHaveLength(23);
    });

    it('has static channels at correct commIds', () => {
        expect(primary.getRoomByCommId(0).riff).toBe('CTRL');
        expect(primary.getRoomByCommId(2).riff).toBe('LOBBY');
        expect(primary.getRoomByCommId(191).riff).toBe('MCCHAT');
    });

    it('rooms are named MCC01 through MCC20', () => {
        expect(primary.roomList).toContain('MCC01');
        expect(primary.roomList).toContain('MCC10');
        expect(primary.roomList).toContain('MCC20');
    });

    it('MCC room commIds are 221 through 240', () => {
        for (let i = 1; i <= 20; i++) {
            const padded = String(i).padStart(2, '0');
            const room = primary.getRoomByCommId(220 + i);
            expect(room).toBeDefined();
            if (typeof room === 'undefined') {
                throw new Error(`Room MCC${padded} not found`);
            }
            expect(room.riff).toBe(`MCC${padded}`);
        }
    });

    it('each room has a BytableChannelData', () => {
        const room = primary.getRoomByCommId(221);
        expect(room).toBeDefined();
        if (typeof room === 'undefined') {
            throw new Error('Room MCC01 not found');
        }   
        expect(room.channelData).toBeInstanceOf(BytableChannelData);
    });

    it('can be created without env vars when host and port are passed directly', () => {
        expect(() => new PrimaryRoomServer('localhost', 9000)).not.toThrow();
    });
});
