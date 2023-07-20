import assert from "node:assert";
import { describe, it } from "vitest";

import {
    ConnectionManager,
    getConnectionManager,
    rawConnectionHandler,
    socketEndHandler,
    socketErrorHandler,
} from "@mcos/gateway";
import {
    Logger,
    NetworkSocket,
    ServerConfiguration,
    SocketWithConnectionInfo,
} from "@mcos/interfaces";
import { IConnectionFactory, ISocketTestFactory } from "@mcos/shared";
import { mock } from "node:test";

describe("rawConnectionListener", () => {
    it("should set event listeners", () => {
        // Arrange
        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
            log: fakeLog,
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
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
                    log: fakeLog,
                }),
            /localPort or remoteAddress is undefined/,
        );
    });

    it("should throw an error if remoteAddress is undefined", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        fakeSocket.remoteAddress = undefined;
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
                    log: fakeLog,
                }),
            /localPort or remoteAddress is undefined/,
        );
    });

    it("should handle the end event", () => {
        // Arrange

        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
            log: fakeLog,
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
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
            log: fakeLog,
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
                    log: mock.fn(),
                }),
            "test",
        );
    });

    it("should log when called with ECONNRESET", () => {
        const logSpy = mock.fn();
        socketErrorHandler({
            error: {
                message: "ECONNRESET",
                code: -1,
            },
            sock: ISocketTestFactory(),
            log: logSpy,
        });
        assert(logSpy.mock.calls.length === 1);
    });

    it("should attempt to destroy the socket if no longer writable", () => {
        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
            log: fakeLog,
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

        assert(connectionManager.connections.length === 0);

        connectionManager.addConnection(fakeConnection);
        const logSpy = mock.fn();

        assert.equal(connectionManager.connections.length, 1);

        const removeConnectionSpy = mock.method(
            connectionManager,
            "removeConnection",
        );

        socketEndHandler({
            log: logSpy,
            connectionRecord: fakeConnectionRecord,
        });

        assert.equal(logSpy.mock.calls.length, 1);

        assert.equal(removeConnectionSpy.mock.calls[0].arguments, "1234");

        assert.equal(connectionManager.connections.length, 0);
    });
});

describe("socketDataHandler", () => {
    it("should call it's processData function", () => {
        // Arrange
        const fakeSocket: NetworkSocket = ISocketTestFactory();
        const fakeLog: Logger = mock.fn();
        const fakeConfig: ServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
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
            log: fakeLog,
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
