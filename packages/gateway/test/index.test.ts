import assert from "node:assert";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { mock } from "node:test";
import {
    NetworkSocket,
    SocketWithConnectionInfo,
} from "../../interfaces/index.js";
import { ISocketTestFactory, IConnectionFactory } from "../../shared/index.js";
import {
    ConnectionManager,
    getConnectionManager,
} from "../src/ConnectionManager.js";
import {
    rawConnectionHandler,
    socketErrorHandler,
    socketEndHandler,
} from "../src/index.js";
import { Configuration } from "../../shared/Configuration.js";
import pino from "pino";

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

describe("rawConnectionListener", () => {
    it("should set event listeners", () => {
        // Arrange
        const fakeSocket: NetworkSocket = ISocketTestFactory();

        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "abc";
        fakeConnection.socket = fakeSocket;

        const eventSpy = mock.method(fakeSocket, "on");

        const connectionManager = new ConnectionManager();

        connectionManager.connections.push(fakeConnection);

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: pino(),
        });

        // Assert
        assert(eventSpy.mock.calls.length === 3);
        // element 0 is the event that was emitted
        assert.deepEqual(eventSpy.mock.calls[0].arguments[0], "end");
        assert.deepEqual(eventSpy.mock.calls[1].arguments[0], "data");
        assert.deepEqual(eventSpy.mock.calls[2].arguments[0], "error");
    });

    it("should throw an error if localPort is undefined", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        fakeSocket.localPort = undefined;
        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "def";
        fakeConnection.socket = fakeSocket;

        const connectionManager = new ConnectionManager();

        connectionManager.connections.push(fakeConnection);

        // Act

        // Assert
        assert.throws(
            () =>
                rawConnectionHandler({
                    incomingSocket: fakeSocket,
                    config: fakeConfig,
                    log: pino(),
                }),
            /localPort or remoteAddress is undefined/,
        );
    });

    it("should throw an error if remoteAddress is undefined", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        fakeSocket.remoteAddress = undefined;
        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "ghi";
        fakeConnection.socket = fakeSocket;

        const connectionManager = new ConnectionManager();

        connectionManager.connections.push(fakeConnection);

        // Act

        // Assert
        assert.throws(
            () =>
                rawConnectionHandler({
                    incomingSocket: fakeSocket,
                    config: fakeConfig,
                    log: pino(),
                }),
            /localPort or remoteAddress is undefined/,
        );
    });

    it("should handle the end event", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "jkl";
        fakeConnection.socket = fakeSocket;

        const eventSpy = mock.method(fakeSocket, "on");
        const fakeOnEnd = mock.fn();
        const connectionManager = new ConnectionManager();
        connectionManager.connections = [];

        connectionManager.connections.push(fakeConnection);

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: pino(),
            onSocketEnd: fakeOnEnd,
        });
        fakeSocket.emit("end");

        // Assert
        assert(eventSpy.mock.calls.length === 3);
        // element 0 is the event that was emitted
        assert.deepEqual(eventSpy.mock.calls[0].arguments[0], "end");
        assert.deepEqual(eventSpy.mock.calls[1].arguments[0], "data");
        assert.deepEqual(eventSpy.mock.calls[2].arguments[0], "error");
        assert(fakeOnEnd.mock.calls.length === 1);
    });

    it("should handle the data event", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const connection = IConnectionFactory();
        connection.id = "nope";
        connection.socket = fakeSocket;

        const connectionManager = new ConnectionManager();

        const fakeOnData = mock.fn();

        connectionManager.connections = [];

        connectionManager.connections.push(connection);

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: pino(),
            onSocketData: fakeOnData,
        });

        fakeSocket.emit(
            "data",
            Buffer.from([
                0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100,
                0x100,
            ]),
        );

        // Assert
        assert(fakeOnData.mock.calls.length === 1);
    });
});

describe("socketErrorHandler", () => {
    it("should throw when called", () => {
        assert.throws(
            () =>
                socketErrorHandler({
                    error: {
                        message: "test",
                        code: -1,
                    },
                    sock: ISocketTestFactory(),
                    log: pino(),
                }),
            "test",
        );
    });

    it("should log when called with ECONNRESET", () => {
        const log = pino()
        const logSpy = vi.spyOn(log, "debug");
        socketErrorHandler({
            error: {
                message: "ECONNRESET",
                code: -1,
            },
            sock: ISocketTestFactory(),
            log,
        });
        expect(logSpy).toBeCalled();
        expect(logSpy).toBeCalledWith("Connection was reset");
    });

    it("should attempt to destroy the socket if no longer writable", () => {
        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "1234";
        fakeConnection.socket = fakeSocket;
        fakeConnection.socket.writable = false;

        const connectionManager = new ConnectionManager();
        connectionManager.connections = [];

        connectionManager.connections.push(fakeConnection);

        const spyOnErrorEvent = mock.fn();

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            onSocketError: spyOnErrorEvent,
            log: pino(),
        });

        fakeSocket.emit("error", {
            message: "ECONNRESET",
            code: -1,
        });

        // Assert
        assert(spyOnErrorEvent.mock.calls.length === 1);
    });
});

describe("socketEndHandler", () => {
    it("should log when called", () => {
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "1234";

        const fakeConnectionRecord: SocketWithConnectionInfo = {
            id: "1234",
            localPort: 0,
            remoteAddress: "",
            socket: ISocketTestFactory(),
            encryptionSession: undefined,
            useEncryption: false,
            connectionId: "",
            seq: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
        };

        const connectionManager = getConnectionManager();
        connectionManager.connections = [];

        expect(connectionManager.connections.length).toBe(0);

        connectionManager.addConnection(fakeConnection);

        expect(connectionManager.connections.length).toBe(1);

        const removeConnectionSpy = mock.method(
            connectionManager,
            "removeConnection",
        );

        socketEndHandler({
            log: pino(),
            connectionRecord: fakeConnectionRecord,
        });

        assert.equal(removeConnectionSpy.mock.calls[0].arguments, "1234");

        assert.equal(connectionManager.connections.length, 0);
    });
});

describe("socketDataHandler", () => {
    it("should call it's processData function", () => {
        // Arrange
        const fakeSocket: NetworkSocket = ISocketTestFactory();

        const fakeConfig: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.socket = fakeSocket;

        const connectionManager = new ConnectionManager();
        connectionManager.connections = [];
        const fakeOnSocketData = mock.fn();

        connectionManager.connections.push(fakeConnection);

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: pino(),
            onSocketData: fakeOnSocketData,
        });

        fakeSocket.emit(
            "data",
            Buffer.from([
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xaa, 0x00, 0x00,
            ]),
        );

        // Assert
        assert(fakeOnSocketData.mock.calls.length === 1);
    });
});
