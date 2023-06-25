import sinon from "sinon";
import sinonChai from "sinon-chai";
import chai, { expect } from "chai";
import { describe, it } from "mocha";
import {
    IConnectionFactory,
    ISocketTestFactory,
    MessageHeader,
} from "mcos/shared";
import {
    rawConnectionHandler,
    socketEndHandler,
    socketErrorHandler,
} from "./index.js";
import {
    ConnectionManager,
    getConnectionManager,
} from "./ConnectionManager.js";
import {
    ISocket,
    TServerLogger,
    TServerConfiguration,
    TSocketWithConnectionInfo,
    ELOG_LEVEL,
} from "mcos/shared/interfaces";

chai.use(sinonChai);

describe("rawConnectionListener", () => {
    beforeEach(() => {
        sinon.restore();
    });

    it("should set event listeners", () => {
        // Arrange
        const fakeSocket: ISocket = ISocketTestFactory();
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "abc";
        fakeConnection.socket = fakeSocket;

        const eventSpy = sinon.spy(fakeSocket, "on");

        new ConnectionManager().connections.push(fakeConnection);

        // Act
        const result = rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: fakeLog,
        });

        // Assert
        expect(eventSpy).to.have.been.calledThrice;
        expect(eventSpy).to.have.been.calledWith("end");
        expect(eventSpy).to.have.been.calledWith("data");
        expect(eventSpy).to.have.been.calledWith("error");
    });

    it("should throw an error if localPort is undefined", () => {
        // Arrange

        const fakeSocket: ISocket = ISocketTestFactory();
        fakeSocket.localPort = undefined;
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "def";
        fakeConnection.socket = fakeSocket;

        new ConnectionManager().connections.push(fakeConnection);

        // Act

        // Assert
        expect(() =>
            rawConnectionHandler({
                incomingSocket: fakeSocket,
                config: fakeConfig,
                log: fakeLog,
            })
        ).to.throw("localPort or remoteAddress is undefined");
    });

    it("should throw an error if remoteAddress is undefined", () => {
        // Arrange

        const fakeSocket: ISocket = ISocketTestFactory();
        fakeSocket.remoteAddress = undefined;
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "ghi";
        fakeConnection.socket = fakeSocket;

        new ConnectionManager().connections.push(fakeConnection);

        // Act

        // Assert
        expect(() =>
            rawConnectionHandler({
                incomingSocket: fakeSocket,
                config: fakeConfig,
                log: fakeLog,
            })
        ).to.throw("localPort or remoteAddress is undefined");
    });

    it("should handle the end event", () => {
        // Arrange

        const fakeSocket: ISocket = ISocketTestFactory();
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "jkl";
        fakeConnection.socket = fakeSocket;

        const eventSpy = sinon.spy(fakeSocket, "on");
        const fakeOnEnd = sinon.stub();
        const logSpy = sinon.spy(fakeLog);
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        ConnectionManagerStub.connections = [];

        ConnectionManagerStub.connections.push(fakeConnection);

        // Act
        rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: fakeLog,
            onSocketEnd: fakeOnEnd,
        });
        fakeSocket.emit("end");

        // Assert
        expect(eventSpy).to.have.been.calledThrice;
        expect(eventSpy).to.have.been.calledWith("end");
        expect(eventSpy).to.have.been.calledWith("data");
        expect(eventSpy).to.have.been.calledWith("error");
        expect(fakeOnEnd).to.have.been.called;
    });

    it("should handle the data event", () => {
        // Arrange

        const fakeSocket: ISocket = ISocketTestFactory();
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const connection = IConnectionFactory();
        connection.id = "nope";
        connection.socket = fakeSocket;

        const fakeConnectionRecord: TSocketWithConnectionInfo = {
            id: "1234",
            localPort: 0,
            remoteAddress: "",
            socket: fakeSocket,
            encryptionSession: undefined,
            useEncryption: false,
            connectionId: "",
            seq: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
        };

        const logSpy = sinon.spy(fakeLog);
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        sinon.stub(MessageHeader, "deserialize").returns({
            length: 0,
            signature: "",

            serialize: () => Buffer.from(""),
        });

        const fakeOnData = sinon.stub();

        ConnectionManagerStub.connections = [];

        ConnectionManagerStub.connections.push(connection);

        // Act
        const listener = rawConnectionHandler({
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
            ])
        );

        // Assert
        expect(fakeOnData).to.have.been.called;
    });
});

describe("socketErrorHandler", () => {
    beforeEach(() => {
        sinon.restore();
    });

    it("should throw when called", () => {
        expect(() =>
            socketErrorHandler({
                error: {
                    message: "test",
                    code: -1,
                },
                sock: ISocketTestFactory(),
                log: (level: ELOG_LEVEL, msg: string) => {},
            })
        ).to.throw("test");
    });

    it("should log when called with ECONNRESET", () => {
        const logSpy = sinon.spy();
        socketErrorHandler({
            error: {
                message: "ECONNRESET",
                code: -1,
            },
            sock: ISocketTestFactory(),
            log: logSpy,
        });
        expect(logSpy).to.have.been.called;
    });
});

describe("socketEndHandler", () => {
    beforeEach(() => {
        sinon.restore();
    });

    it("should log when called", () => {
        const fakeConnection = IConnectionFactory();
        fakeConnection.id = "1234";

        const fakeConnectionRecord: TSocketWithConnectionInfo = {
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

        const ConnectionManagerSpy = sinon.spy(getConnectionManager());
        ConnectionManagerSpy.connections = [];

        expect(ConnectionManagerSpy.connections.length).to.equal(0);

        ConnectionManagerSpy.addConnection(fakeConnection);
        const logSpy = sinon.spy();

        expect(ConnectionManagerSpy.connections.length).to.equal(1);

        socketEndHandler({
            log: logSpy,
            connectionRecord: fakeConnectionRecord,
        });

        expect(logSpy).to.have.been.called;

        expect(ConnectionManagerSpy.removeConnection).to.have.been.calledWith(
            "1234"
        );

        expect(ConnectionManagerSpy.getAllConnections().length).to.equal(0);
    });
});

describe("socketDataHandler", () => {
    beforeEach(() => {
        sinon.restore();
    });

    it("should call it's processData function", () => {
        // Arrange
        const fakeSocket: ISocket = ISocketTestFactory();
        const fakeLog: TServerLogger = (level, msg) => {};
        const fakeConfig: TServerConfiguration = {
            EXTERNAL_HOST: "localhost",
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: "debug",
        };
        const fakeConnection = IConnectionFactory();
        fakeConnection.socket = fakeSocket;

        const fakeConnectionRecord: TSocketWithConnectionInfo = {
            id: "1234",
            localPort: 0,
            remoteAddress: "",
            socket: fakeSocket,
            encryptionSession: undefined,
            useEncryption: false,
            connectionId: "",
            seq: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
        };

        const logSpy = sinon.spy(fakeLog);
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        ConnectionManagerStub.connections = [];
        const fakeO = sinon.stub();

        ConnectionManagerStub.connections.push(fakeConnection);

        // Act
        const listener = rawConnectionHandler({
            incomingSocket: fakeSocket,
            config: fakeConfig,
            log: fakeLog,
            onSocketData: fakeO,
        });

        fakeSocket.emit(
            "data",
            Buffer.from([
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xaa, 0x00, 0x00,
            ])
        );

        // Assert
        expect(fakeO).to.have.been.called;
    });
});
