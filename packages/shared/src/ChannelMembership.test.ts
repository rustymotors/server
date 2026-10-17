import { describe, it, expect, beforeEach } from 'vitest';
import {
    joinChannel,
    leaveChannel,
    leaveAllChannels,
    getChannelMembers,
    getConnectionChannels,
    setConnectionUserId,
    getConnectionIdByUserId,
    _resetChannelMembership,
} from './ChannelMembership.js';

beforeEach(() => _resetChannelMembership());

describe('joinChannel / getChannelMembers', () => {
    it('records a member in a channel', () => {
        joinChannel('conn1', 5);
        expect(getChannelMembers(5)).toContain('conn1');
    });

    it('returns multiple members', () => {
        joinChannel('conn1', 5);
        joinChannel('conn2', 5);
        expect(getChannelMembers(5).sort()).toEqual(['conn1', 'conn2']);
    });

    it('returns empty array for unknown commId', () => {
        expect(getChannelMembers(99)).toEqual([]);
    });
});

describe('leaveChannel', () => {
    it('removes a specific member from a channel', () => {
        joinChannel('conn1', 5);
        joinChannel('conn2', 5);
        leaveChannel('conn1', 5);
        expect(getChannelMembers(5)).toEqual(['conn2']);
    });

    it('is a no-op for unknown connectionId', () => {
        joinChannel('conn1', 5);
        leaveChannel('unknown', 5);
        expect(getChannelMembers(5)).toContain('conn1');
    });
});

describe('leaveAllChannels', () => {
    it('removes a connection from all its channels and returns the vacated commIds', () => {
        joinChannel('conn1', 1);
        joinChannel('conn1', 2);
        joinChannel('conn2', 1);
        const vacated = leaveAllChannels('conn1');
        expect(vacated.sort()).toEqual([1, 2]);
        expect(getChannelMembers(1)).toEqual(['conn2']);
        expect(getChannelMembers(2)).toEqual([]);
        expect(getConnectionChannels('conn1')).toEqual([]);
    });

    it('returns empty array for unknown connectionId', () => {
        expect(leaveAllChannels('nobody')).toEqual([]);
    });
});

describe('getConnectionChannels', () => {
    it('returns all commIds a connection has joined', () => {
        joinChannel('conn1', 3);
        joinChannel('conn1', 7);
        expect(getConnectionChannels('conn1').sort()).toEqual([3, 7]);
    });
});

describe('userId ↔ connectionId lookup', () => {
    it('resolves a userId to its connectionId', () => {
        setConnectionUserId('conn1', 42);
        expect(getConnectionIdByUserId(42)).toBe('conn1');
    });

    it('returns undefined for unknown userId', () => {
        expect(getConnectionIdByUserId(999)).toBeUndefined();
    });

    it('clears userId mapping on leaveAllChannels', () => {
        setConnectionUserId('conn1', 42);
        leaveAllChannels('conn1');
        expect(getConnectionIdByUserId(42)).toBeUndefined();
    });

    it('updates reverse index when userId changes for a connection', () => {
        setConnectionUserId('conn1', 10);
        setConnectionUserId('conn1', 20);
        expect(getConnectionIdByUserId(10)).toBeUndefined();
        expect(getConnectionIdByUserId(20)).toBe('conn1');
    });
});
