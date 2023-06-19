import sinon from "sinon";
import sinonChai from "sinon-chai";
import chai, { expect } from "chai";
import { describe, it } from "mocha";
import {
    IConnectionFactory,
    ISocket,
    ISocketTestFactory,
    TServerConfiguration,
    TServerLogger,
    TSocketWithConnectionInfo,
} from "mcos/shared";
import { ServerError } from "../../../src/rebirth/ServerError.js";
import { TCPListener } from "../src/index.js";
import { ConnectionManager } from "../src/ConnectionManager.js";
import { MessageHeader } from "../../../src/rebirth/MessageHeader.js";

chai.use(sinonChai);

describe("TCPListener", () => {
    afterEach(() => {
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
        fakeConnection.socket = fakeSocket;

        const eventSpy = sinon.spy(fakeSocket, "on");

        new ConnectionManager().connections.push(fakeConnection);

        // Act
        const result = TCPListener({
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
        fakeConnection.socket = fakeSocket;

        new ConnectionManager().connections.push(fakeConnection);

        // Act

        // Assert
        expect(() =>
            TCPListener({
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
        fakeConnection.socket = fakeSocket;

        new ConnectionManager().connections.push(fakeConnection);

        // Act

        // Assert
        expect(() =>
            TCPListener({
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
        fakeConnection.socket = fakeSocket;

        const eventSpy = sinon.spy(fakeSocket, "on");
        const fakeOnEnd = sinon.stub();
        const logSpy = sinon.spy(fakeLog);
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        ConnectionManagerStub.connections = [];

        ConnectionManagerStub.connections.push(fakeConnection);

        // Act
        TCPListener({
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
        const listener = TCPListener({
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
