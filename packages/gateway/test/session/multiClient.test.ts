/**
 * Multi-client integration tests.
 *
 * These tests verify that relay/broadcast handlers deliver packets through
 * REAL MessageQueue instances — complementing the unit tests in
 * packages/lobby/src/handlers/ which mock getSocketQueue.
 *
 * Setup: real ChannelMembership state, real queues (via TestClient), mock DB.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    joinChannel,
    setConnectionUserId,
    databaseProvider,
} from 'rusty-motors-shared';
import { _resetChannelMembership } from 'rusty-motors-shared/test';
import { MultiClientSession } from './MultiClientSession.js';
import { relayEnvelope } from './npsMessages.js';

// Import handlers directly — same as the unit tests.
import { handleSendSingleLong } from '../../../../packages/lobby/src/handlers/handleSendSingleLong.js';
import { handleSendNotSingleLong } from '../../../../packages/lobby/src/handlers/handleSendNotSingleLong.js';
import { handleSendBuddyLong } from '../../../../packages/lobby/src/handlers/handleSendBuddyLong.js';
// rooms lib handler — exercises the Phase 1 fix (joinChannel in handleOpenCommChannel)
import { handleOpenCommChannel as roomsHandleOpenCommChannel } from '../../../../libs/@rustymotors/rooms/src/handlers/handleOpenCommChannel.js';
import { openCommChannelPacket } from './npsMessages.js';

import type { BytableMessage } from '@rustymotors/binary';

// Silent logger for tests
const log = {
    debug: vi.fn(), warn: vi.fn(), verbose: vi.fn(),
    info: vi.fn(), error: vi.fn(),
};

// Fake DB user — returned by getUser / findUserByConnectionId
const FAKE_USER = {
    userId: 21,
    userName: 'testuser',
    userData: Buffer.alloc(8),
};

function ensureDb() {
    if (!databaseProvider.isRegistered()) {
        databaseProvider.register({
            session: {
                updateSessionKey: async () => {},
                fetchSessionKeyByCustomerId: async () => ({
                    customerId: 0, sessionKey: 'key', sKey: 'skey',
                    contextId: 'ctx', connectionId: 'conn',
                }),
                fetchSessionKeyByConnectionId: async () => ({
                    customerId: 0, sessionKey: 'key', sKey: 'skey',
                    contextId: 'ctx', connectionId: 'conn',
                }),
                updateUser: async () => {},
                getUser: async () => FAKE_USER,
                updateConnection: async () => {},
                findUserByConnectionId: async () => FAKE_USER.userId,
                updateGameServer: async () => {},
                getGameServers: async () => [],
            },
            gameData: {
                getPlayer: async () => { throw new Error('not in test'); },
                getOwnedVehiclesForPerson: async () => [],
                getVehicleAndParts: async () => null,
                createNewCar: async () => 0,
                purchaseCar: async () => 0,
            },
            auth: {
                isDatabaseConnected: true,
                findUser: async () => ({ customerId: 0, userName: 'test', loginLevel: 0 }),
                findCustomerByContext: () => ({ customerId: 1, contextId: 'ctx', profileId: 1 }),
                updateSession: () => {},
                registerNewUser: () => {},
            },
        });
    }
}

function makeMessage(buf: Buffer): BytableMessage {
    return { serialize: () => buf, header: { id: buf.readUInt16BE(0) } } as unknown as BytableMessage;
}

const COMM_ID = 55;
const USER_A = 10;
const USER_B = 20;
const BLOB = Buffer.from([0xca, 0xfe, 0xba, 0xbe]);

let session: MultiClientSession;

beforeEach(() => {
    _resetChannelMembership();
    ensureDb();
    session = new MultiClientSession();
    vi.clearAllMocks();
});

afterEach(async () => {
    await session?.close();
});

// ---------------------------------------------------------------------------
// Relay: SEND_SINGLE_LONG (0x95)
// ---------------------------------------------------------------------------
describe('SEND_SINGLE_LONG relay via real queues', () => {
    it('delivers the rewritten 12-byte envelope to the target client queue', async () => {
        const alice = session.client('alice');
        const bob   = session.client('bob');

        joinChannel(alice.connectionId, COMM_ID);
        joinChannel(bob.connectionId, COMM_ID);
        setConnectionUserId(alice.connectionId, USER_A);
        setConnectionUserId(bob.connectionId, USER_B);

        // Alice sends SINGLE_LONG targeting Bob (filterUserId = USER_B)
        const frame = relayEnvelope(0x95, COMM_ID, USER_A, USER_B, BLOB);
        await handleSendSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const bobPackets = await bob.drain();
        expect(bobPackets).toHaveLength(1);

        const received = bobPackets[0];
        expect(received.readUInt16BE(0)).toBe(0x95);            // opcode preserved
        expect(received.readUInt16BE(2)).toBe(received.byteLength); // corrected length
        expect(received.byteLength).toBe(frame.byteLength - 4);     // filterUserId stripped
        expect(received.readUInt32BE(4)).toBe(COMM_ID);
        expect(received.readUInt32BE(8)).toBe(USER_A);             // senderUserId preserved
        expect(received.subarray(12)).toEqual(BLOB);               // blob at correct offset

        // Alice's own queue should be empty
        const alicePackets = await alice.drain(0);
        expect(alicePackets).toHaveLength(0);
    });

    it('does not deliver when target is the sender', async () => {
        const alice = session.client('alice');
        setConnectionUserId(alice.connectionId, USER_A);

        const frame = relayEnvelope(0x95, COMM_ID, USER_A, USER_A, BLOB);
        await handleSendSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const packets = await alice.drain();
        expect(packets).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Relay: SEND_BUDDY_LONG (0x93)
// ---------------------------------------------------------------------------
describe('SEND_BUDDY_LONG relay via real queues', () => {
    it('delivers the rewritten envelope to the buddy connection', async () => {
        const alice = session.client('alice');
        const bob   = session.client('bob');

        setConnectionUserId(alice.connectionId, USER_A);
        setConnectionUserId(bob.connectionId, USER_B);

        const frame = relayEnvelope(0x93, COMM_ID, USER_A, USER_B, BLOB);
        await handleSendBuddyLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const bobPackets = await bob.drain();
        expect(bobPackets).toHaveLength(1);
        expect(bobPackets[0].readUInt16BE(0)).toBe(0x93);
        expect(bobPackets[0].byteLength).toBe(frame.byteLength - 4);
    });
});

// ---------------------------------------------------------------------------
// Broadcast: SEND_NOT_SINGLE_LONG (0x97)
// ---------------------------------------------------------------------------
describe('SEND_NOT_SINGLE_LONG broadcast via real queues', () => {
    it('delivers to all channel members except sender and excluded user', async () => {
        const alice   = session.client('alice');
        const bob     = session.client('bob');
        const charlie = session.client('charlie');

        joinChannel(alice.connectionId, COMM_ID);
        joinChannel(bob.connectionId, COMM_ID);
        joinChannel(charlie.connectionId, COMM_ID);

        setConnectionUserId(alice.connectionId, USER_A);
        setConnectionUserId(bob.connectionId, USER_B);
        setConnectionUserId(charlie.connectionId, 30);

        // Alice sends NOT_SINGLE_LONG, excluding Bob (filterUserId = USER_B)
        const frame = relayEnvelope(0x97, COMM_ID, USER_A, USER_B, BLOB);
        await handleSendNotSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        // Charlie should get it
        const charliePackets = await charlie.drain();
        expect(charliePackets).toHaveLength(1);
        expect(charliePackets[0].readUInt16BE(0)).toBe(0x97);

        // Alice (sender) and Bob (excluded) should not
        const alicePackets  = await alice.drain(0);
        const bobPackets    = await bob.drain(0);
        expect(alicePackets).toHaveLength(0);
        expect(bobPackets).toHaveLength(0);
    });

    it('delivers to nobody when only sender and excluded are in channel', async () => {
        const alice = session.client('alice');
        const bob   = session.client('bob');

        joinChannel(alice.connectionId, COMM_ID);
        joinChannel(bob.connectionId, COMM_ID);
        setConnectionUserId(alice.connectionId, USER_A);
        setConnectionUserId(bob.connectionId, USER_B);

        const frame = relayEnvelope(0x97, COMM_ID, USER_A, USER_B, BLOB);
        await handleSendNotSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const alicePackets = await alice.drain(0);
        const bobPackets   = await bob.drain(0);
        expect(alicePackets).toHaveLength(0);
        expect(bobPackets).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Race port relay (ports 9000-9020) — Phase 1 regression
//
// Verifies that rooms handleOpenCommChannel populates ChannelMembership so
// that relay handlers can find race room members via getChannelMembers().
// ---------------------------------------------------------------------------
describe('race port relay via rooms handleOpenCommChannel', () => {
    const RACE_COMM_ID = 9001;
    const RACE_PORT = 9000;

    function makeRoomsMessage(buf: Buffer): BytableMessage {
        return { serialize: () => buf, getBody: () => buf, header: { id: buf.readUInt16BE(0) } } as unknown as BytableMessage;
    }

    it('populates ChannelMembership when clients join via rooms handleOpenCommChannel', async () => {
        const alice = session.client('alice', RACE_PORT);
        const bob   = session.client('bob',   RACE_PORT);

        // Both clients send OPEN_COMM_CHANNEL on the race port (same commId)
        await roomsHandleOpenCommChannel({
            connectionId: alice.connectionId,
            message: makeRoomsMessage(openCommChannelPacket(RACE_COMM_ID, USER_A)),
            log: log as never,
        });
        await roomsHandleOpenCommChannel({
            connectionId: bob.connectionId,
            message: makeRoomsMessage(openCommChannelPacket(RACE_COMM_ID, USER_B)),
            log: log as never,
        });

        // Now relay from Alice to Bob should work
        const frame = relayEnvelope(0x95, RACE_COMM_ID, USER_A, USER_B, BLOB);
        await handleSendSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const bobPackets = await bob.drain();
        expect(bobPackets).toHaveLength(1);
        expect(bobPackets[0]!.readUInt16BE(0)).toBe(0x95);
        expect(bobPackets[0]!.readUInt32BE(4)).toBe(RACE_COMM_ID);

        const alicePackets = await alice.drain(0);
        expect(alicePackets).toHaveLength(0);
    });

    it('SEND_NOT_SINGLE_LONG broadcasts to all race room members except sender', async () => {
        const alice   = session.client('alice',   RACE_PORT);
        const bob     = session.client('bob',     RACE_PORT);
        const charlie = session.client('charlie', RACE_PORT);

        for (const [client, userId] of [[alice, USER_A], [bob, USER_B], [charlie, 30]] as const) {
            await roomsHandleOpenCommChannel({
                connectionId: client.connectionId,
                message: makeRoomsMessage(openCommChannelPacket(RACE_COMM_ID, userId)),
                log: log as never,
            });
        }

        // Alice broadcasts, excluding Bob
        const frame = relayEnvelope(0x97, RACE_COMM_ID, USER_A, USER_B, BLOB);
        await handleSendNotSingleLong({
            connectionId: alice.connectionId,
            message: makeMessage(frame),
            log: log as never,
        });

        const charliePackets = await charlie.drain();
        expect(charliePackets).toHaveLength(1);
        expect(charliePackets[0]!.readUInt16BE(0)).toBe(0x97);

        expect(await alice.drain(0)).toHaveLength(0);
        expect(await bob.drain(0)).toHaveLength(0);
    });
});
