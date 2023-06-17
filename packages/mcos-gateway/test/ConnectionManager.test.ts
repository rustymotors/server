import chai, { expect } from "chai";
import { describe, it } from "mocha";
import {
    connectionList,
    getAllConnections,
    updateConnection,
} from "../src/ConnectionManager.js";
import { Connection } from "../../../src/rebirth/Connection.js";
import {
    ISocketTestFactory,
    TServerLogger,
    TSocketWithConnectionInfo,
} from "mcos/shared";

describe("ConnectionManager", () => {
    describe("Legacy Functions", () => {
        describe("getAllConnections", () => {
            it("should return all connections", () => {
                // arrange
                const newTestConnection1: TSocketWithConnectionInfo = {
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

                const newTestConnection2: TSocketWithConnectionInfo = {
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

                const newTestConnection3: TSocketWithConnectionInfo = {
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

                expect(list).to.be.an("array");
                expect(list.length).to.be.equal(3);
            });
        });

        describe("updateConnection", () => {
            beforeEach(() => {
                connectionList.length = 0;
            });

            it("should update connection", () => {
                // arrange

                const newTestConnection: TSocketWithConnectionInfo = {
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

                const updatedTestConnection: TSocketWithConnectionInfo = {
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

                const fakeLogger: TServerLogger = () => {};

                // act
                connectionList.push(newTestConnection);

                updateConnection(
                    newTestConnection.id,
                    updatedTestConnection,
                    fakeLogger
                );

                const list = getAllConnections();

                // assert
                expect(list).to.be.an("array");
                expect(list.length).to.be.equal(1);
                expect(list[0].id).to.be.equal(updatedTestConnection.id);
            });
        });    
    });
});
