import { beforeAll, beforeEach, describe, it, vi } from "vitest";
import assert from "node:assert";
import { expectTypeOf } from "vitest";
import { SocketWithConnectionInfo } from "../../interfaces/index.js";
import { ISocketTestFactory } from "../../shared/index.js";
import { connectionList, getAllConnections, updateConnection } from "../src/ConnectionManager.js";
import { pino } from "pino";

beforeAll(() => {
    vi.mock("pino", () => {
        return {
            default: vi.fn().mockImplementation(() => {
                return {
                    debug: vi.fn(),
                    info: vi.fn(),
                    warn: vi.fn(),
                    error: vi.fn(),
                };
            }),
            pino: vi.fn().mockImplementation(() => {
                return {
                    debug: vi.fn(),
                    info: vi.fn(),
                    warn: vi.fn(),
                    error: vi.fn(),
                };
            }),
        };
    });
});

describe("ConnectionManager", () => {
    describe("Legacy Functions", () => {
        describe("getAllConnections", () => {
            it("should return all connections", () => {
                // arrange
                const newTestConnection1: SocketWithConnectionInfo = {
                    id: "test",
                    socket: ISocketTestFactory(),
                    useEncryption: false,
                    connectionId: "test",
                    inQueue: false,
                    seq: 0,
                    remoteAddress: "",
                    localPort: 0,
                    personaId: 0,
                    lastMessageTimestamp: 0,
                };

                const newTestConnection2: SocketWithConnectionInfo = {
                    id: "test",
                    socket: ISocketTestFactory(),
                    useEncryption: false,
                    connectionId: "test",
                    inQueue: false,
                    seq: 0,
                    remoteAddress: "",
                    localPort: 0,
                    personaId: 0,
                    lastMessageTimestamp: 0,
                };

                const newTestConnection3: SocketWithConnectionInfo = {
                    id: "test",
                    socket: ISocketTestFactory(),
                    useEncryption: false,
                    connectionId: "test",
                    inQueue: false,
                    seq: 0,
                    remoteAddress: "",
                    localPort: 0,
                    personaId: 0,
                    lastMessageTimestamp: 0,
                };

                connectionList.push(newTestConnection1);
                connectionList.push(newTestConnection2);
                connectionList.push(newTestConnection3);

                // act

                const list = getAllConnections();
                // assert

                expectTypeOf(list).toEqualTypeOf<SocketWithConnectionInfo[]>;
                assert.strictEqual(list.length, 3);
            });
        });

        describe("updateConnection", () => {
            beforeEach(() => {
                connectionList.length = 0;
            });

            it("should update connection", () => {
                // arrange

                const newTestConnection: SocketWithConnectionInfo = {
                    id: "oldConnection",
                    socket: ISocketTestFactory(),
                    useEncryption: false,
                    connectionId: "test",
                    inQueue: false,
                    seq: 0,
                    remoteAddress: "",
                    localPort: 0,
                    personaId: 0,
                    lastMessageTimestamp: 0,
                };

                const updatedTestConnection: SocketWithConnectionInfo = {
                    id: "newConnection",
                    socket: ISocketTestFactory(),
                    useEncryption: false,
                    connectionId: "test",
                    inQueue: false,
                    seq: 0,
                    remoteAddress: "",
                    localPort: 0,
                    personaId: 0,
                    lastMessageTimestamp: 0,
                };

                // act
                connectionList.push(newTestConnection);

                updateConnection(
                    newTestConnection.id,
                    updatedTestConnection,
                    pino(),
                );

                const list = getAllConnections();

                // assert
                expectTypeOf(list).toEqualTypeOf<SocketWithConnectionInfo[]>;
                assert.strictEqual(list.length, 1);
                assert.strictEqual(list[0].id, updatedTestConnection.id);
            });
        });
    });
});
