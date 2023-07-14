import { beforeEach, describe, it } from "node:test";
import {
    connectionList,
    getAllConnections,
    updateConnection,
} from "@mcos/gateway";
import { ISocketTestFactory } from "@mcos/shared";
import { SocketWithConnectionInfo, Logger } from "@mcos/interfaces";
import assert from "node:assert";

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

                assert.equal(typeof list, "array")
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

                const fakeLogger: Logger = () => {};

                // act
                connectionList.push(newTestConnection);

                updateConnection(
                    newTestConnection.id,
                    updatedTestConnection,
                    fakeLogger,
                );

                const list = getAllConnections();

                // assert
                assert.equal(typeof list, "array")
                assert.strictEqual(list.length, 1);
                assert.strictEqual(list[0].id, updatedTestConnection.id);
            });
        });
    });
});
