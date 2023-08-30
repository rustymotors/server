// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { describe, it, expect } from "vitest";
import assert from "node:assert";
import { Logger, SocketWithConnectionInfo } from "../../interfaces/index.js";
import { ISocketTestFactory } from "../../shared/index.js";
import { getAdminServer, AdminServer } from "../src/AdminServer.js";
import { resetQueue } from "../src/resetQueue.js";

describe("AdminServer", () => {
    describe(".getAdminServer", () => {
        it("should return an instance of AdminServer", () => {
            // Arrange
            const log: Logger = () => {
                return;
            };

            // Act
            const newAdminInstance = getAdminServer(log);

            // Assert
            expect(newAdminInstance).toBeInstanceOf(AdminServer);
        });
        it("should return the same instance of AdminServer on multiple calls", () => {
            // Arrange
            const log: Logger = () => {
                return;
            };

            // Act
            const admin1 = getAdminServer(log);
            const admin2 = getAdminServer(log);

            // Assert
            expect(admin1).toEqual(admin2);
        });
    });
});

describe("resetQueue()", function () {
    it("should reset the inQueue property to true for all connections", function () {
        // arrange
        const inputConnectionList: SocketWithConnectionInfo[] = [
            {
                connectionId: "A",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: false,
                useEncryption: false,
            },
            {
                connectionId: "B",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: false,
                useEncryption: false,
            },
            {
                connectionId: "C",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: false,
                useEncryption: false,
            },
        ];
        const expectedConnectionList: SocketWithConnectionInfo[] = [
            {
                connectionId: "A",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: true,
                useEncryption: false,
            },
            {
                connectionId: "B",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: true,
                useEncryption: false,
            },
            {
                connectionId: "C",
                socket: ISocketTestFactory(),
                seq: 0,
                id: "A",
                remoteAddress: "0.0.0.0",
                localPort: 0,
                personaId: 0,
                lastMessageTimestamp: 0,
                inQueue: true,
                useEncryption: false,
            },
        ];

        // act
        const result: SocketWithConnectionInfo[] = JSON.parse(
            resetQueue(inputConnectionList).body,
        );

        // assert
        assert.deepStrictEqual(
            result[1].inQueue,
            expectedConnectionList[1].inQueue,
        );
    });
});
