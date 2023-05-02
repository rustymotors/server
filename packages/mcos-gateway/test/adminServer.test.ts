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

import chai, { expect } from "chai";
import { AdminServer, resetQueue } from "mcos/gateway";
import { TServerLogger, TSocketWithConnectionInfo } from "mcos/shared";
import { describe, it } from "mocha";
import { Socket } from "net";

chai.should();

describe("AdminServer", () => {
    describe(".getAdminServer", () => {
        it("should return an instance of AdminServer", () => {
            // Arrange
            /**  @type {TServerLogger} */
            const log: TServerLogger = () => {
                return;
            };

            // Act
            const newAdminInstance = AdminServer.getAdminServer(log);

            // Assert
            newAdminInstance.should.be.instanceOf(AdminServer);
        });
        it("should return the same instance of AdminServer on multiple calls", () => {
            // Arrange
            /**  @type {TServerLogger} */
            const log: TServerLogger = () => {
                return;
            };

            // Act
            const admin1 = AdminServer.getAdminServer(log);
            const admin2 = AdminServer.getAdminServer(log);

            // Assert
            admin1.should.equal(admin2);
        });
    });
});

describe("resetQueue()", function () {
    it("should reset the inQueue property to true for all connections", function () {
        // arrange
        /** @type {TSocketWithConnectionInfo[]} */
        const inputConnectionList: TSocketWithConnectionInfo[] = [
            {
                socket: new Socket(),
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
                socket: new Socket(),
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
                socket: new Socket(),
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
        /** @type {TSocketWithConnectionInfo[]} */
        const expectedConnectionList: TSocketWithConnectionInfo[] = [
            {
                socket: new Socket(),
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
                socket: new Socket(),
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
                socket: new Socket(),
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
        /** @type {TSocketWithConnectionInfo[]} */
        const result: TSocketWithConnectionInfo[] = JSON.parse(resetQueue(inputConnectionList).body);

        // assert
        expect(result[1]?.inQueue).to.equal(expectedConnectionList[1]?.inQueue);
    });
});
