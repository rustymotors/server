import { describe, it } from "vitest";
import assert from "node:assert";

import { EncryptionManager, generateEncryptionPair } from "@mcos/gateway";
import {
    SessionKeys,
    SocketWithConnectionInfo,
    ClientConnection,
} from "@mcos/interfaces";
import {
    Connection,
    IConnectionFactory,
    ISocketTestFactory,
} from "@mcos/shared";

describe("EncryptionManager (legacy)", () => {
    it("given the same keys, should always return same EncryptionSession", () => {
        // arrange
        const testSocket1: SocketWithConnectionInfo = {
            socket: ISocketTestFactory(),
            connectionId: "test1",
            remoteAddress: "",
            seq: 0,
            id: "test1",
            localPort: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
            useEncryption: false,
        };

        const testSocket2: SocketWithConnectionInfo = {
            socket: ISocketTestFactory(),
            connectionId: "test2",
            remoteAddress: "",
            seq: 0,
            id: "test2",
            localPort: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
            useEncryption: false,
        };

        // These are keys from a real session, but the values are not important
        const testKeys: SessionKeys = {
            sessionKey:
                "254a7a0703a3a2c4df687a3969d3577bb8350efc3950c1c22f76415227ac5f21",
            sKey: "254a7a0703a3a2c4",
        };

        // act
        const session1 = generateEncryptionPair(testSocket1, testKeys);
        const session2 = generateEncryptionPair(testSocket2, testKeys);

        // assert
        assert.deepStrictEqual(session1.sessionKey, session2.sessionKey);
    });
});

describe("EncryptionManager", () => {
    it("given the same keys, should always return same EncryptionSession", () => {
        // arrange
        const manager1 = new EncryptionManager();
        const manager2 = new EncryptionManager();

        const testConnection1: ClientConnection = {
            socket: ISocketTestFactory(),
            status: Connection.INACTIVE,
            appID: 0,
            id: "test1",
            remoteAddress: "",
            seq: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
            useEncryption: false,
            port: 0,
            ip: null,
        };

        const testConnection2: ClientConnection = {
            socket: ISocketTestFactory(),
            status: Connection.INACTIVE,
            appID: 0,
            id: "test2",
            remoteAddress: "",
            seq: 0,
            personaId: 0,
            lastMessageTimestamp: 0,
            inQueue: false,
            useEncryption: false,
            port: 0,
            ip: null,
        };

        // These are keys from a real session, but the values are not important
        const testKeys: SessionKeys = {
            sessionKey:
                "254a7a0703a3a2c4df687a3969d3577bb8350efc3950c1c22f76415227ac5f21",
            sKey: "254a7a0703a3a2c4",
        };

        // act
        const session1 = manager1.generateEncryptionPair(
            testConnection1,
            testKeys,
        );
        const session2 = manager2.generateEncryptionPair(
            testConnection2,
            testKeys,
        );

        // assert
        assert.deepStrictEqual(session1.sessionKey, session2.sessionKey);
    });

    it("should be able to encrypt and decrypt a message", () => {
        // arrange
        const manager = new EncryptionManager();

        const testConnection1: ClientConnection = IConnectionFactory();
        const testConnection2: ClientConnection = IConnectionFactory();

        const message1 = Buffer.from("test message");
        const message2 = Buffer.from("test message 2");

        // These are keys from a real session, but the values are not important
        const testKeys: SessionKeys = {
            sessionKey:
                "254a7a0703a3a2c4df687a3969d3577bb8350efc3950c1c22f76415227ac5f21",
            sKey: "254a7a0703a3a2c4",
        };

        testConnection1.encryptionSession = manager.generateEncryptionPair(
            testConnection1,
            testKeys,
        );

        testConnection2.encryptionSession = manager.generateEncryptionPair(
            testConnection2,
            testKeys,
        );

        // act
        const encryptedMessage =
            testConnection1.encryptionSession.tsCipher.update(message1);
        const decryptedMessage =
            testConnection2.encryptionSession.tsCipher.update(encryptedMessage);

        const encryptedMessage2 =
            testConnection2.encryptionSession.tsCipher.update(message2);

        const decryptedMessage2 =
            testConnection1.encryptionSession.tsCipher.update(
                encryptedMessage2,
            );

        // assert
        assert.deepStrictEqual(decryptedMessage, message1);
        assert.deepStrictEqual(decryptedMessage2, message2);
    });
});
