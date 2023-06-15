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
import { TCPListener, onSocketData, onSocketError } from "../src/index.js";
import { ConnectionManager } from "../src/ConnectionManager.js";
import { MessageHeader } from "../../../src/rebirth/MessageHeader.js";

chai.use(sinonChai);

describe("onSocketError", () => {
    it("should log an error", () => {
        // Arrange

        const log: TServerLogger = (level, msg) => {
            console.log(level, msg);
        };
        const fakeSocket: ISocket = ISocketTestFactory();
        const error = new ServerError("ECONNRESET");
        const logSpy = sinon.spy(log);

        // Act

        onSocketError(fakeSocket, error, logSpy);

        // Assert
        expect(logSpy).to.have.been.calledOnce;
        expect(logSpy).not.throw;
        expect(logSpy).to.have.been.calledWith("debug", "Connection was reset");
    });

    it("should throw an error", () => {
        // Arrange

        const log: TServerLogger = (level, msg) => {
            console.log(level, msg);
        };
        const fakeSocket: ISocket = ISocketTestFactory();
        const error = new ServerError("EERROR");
        const logSpy = sinon.spy(log);

        // Act

        // Assert
        expect(() => onSocketError(fakeSocket, error, logSpy)).to.throw(
            "EERROR"
        );
    });
});

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
        const result = TCPListener(fakeSocket, fakeConfig, fakeLog);

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
        expect(() => TCPListener(fakeSocket, fakeConfig, fakeLog)).to.throw(
            "localPort or remoteAddress is undefined"
        );
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
        expect(() => TCPListener(fakeSocket, fakeConfig, fakeLog)).to.throw(
            "localPort or remoteAddress is undefined"
        );
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
        const logSpy = sinon.spy(fakeLog);
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        ConnectionManagerStub.connections = [];

        ConnectionManagerStub.connections.push(fakeConnection);

        // Act
        TCPListener(fakeSocket, fakeConfig, logSpy);
        fakeSocket.emit("end");

        // Assert
        expect(eventSpy).to.have.been.calledThrice;
        expect(eventSpy).to.have.been.calledWith("end");
        expect(eventSpy).to.have.been.calledWith("data");
        expect(eventSpy).to.have.been.calledWith("error");
        expect(logSpy).to.have.been.called;
        expect(logSpy).to.have.been.calledWith(
            "debug",
            sinon.match("disconnected")
        );
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
        const module = { onSocketData };
        const logOnSocketDataSpy = sinon.spy(module, "onSocketData");
        const ConnectionManagerStub = sinon.stub(ConnectionManager.prototype);
        sinon.stub(MessageHeader, "deserialize").returns({
            length: 0,
            signature: "",

            serialize: () => Buffer.from(""),
        });

        ConnectionManagerStub.connections = [];

        ConnectionManagerStub.connections.push(connection);

        // Act
        onSocketData(
            fakeSocket,
            Buffer.from([
                0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100, 0x100,
                0x100,
            ]),
            fakeLog,
            fakeConfig,
            connection,
            fakeConnectionRecord
        );

        // Assert
        expect(logOnSocketDataSpy).to.have.been.called;
        expect(logSpy.callCount).to.equal(1);
        expect(logSpy).to.have.been.calledWith(sinon.match("Received data"));
    });
});
