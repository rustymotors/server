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

import chai from "chai";
import { GSMessageBase } from "../src/GMessageBase.js";
import { describe, it } from "mocha";
import type { ByteField } from "mcos-types/types.js";

chai.should();

describe("GSMessageBase", () => {
    describe(".byteLength", () => {
        it("should hvave a value of 2", () => {
            // Arrange
            const testMessage = new GSMessageBase();

            // Assert
            testMessage.getByteLength().should.equal(10);
        });
    });
    describe("#deserialize", () => {
        it("should handle an input stream without errors", () => {
            // Arrange
            const testMessage = new GSMessageBase();

            // Assert
            (() => {
                return testMessage.deserialize(Buffer.from([1, 2, 3, 4]));
            }).should.not.throw();
        });
    });
    describe("#get", () => {
        it("should return a ByteField object when passed a valid field name", () => {
            // Arrange
            const testMessage = new GSMessageBase();
            const expectedField: ByteField = {
                name: "msgId",
                size: 2,
                offset: 0,
                type: "u16",
                value: Buffer.alloc(2),
                order: "little",
            };

            // Assert
            testMessage.get("msgId").should.deep.equal(expectedField);
        });
    });
});
