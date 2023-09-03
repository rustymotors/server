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
import { BinaryStructureBase } from "../BinaryStructure.js";
import { mock } from "node:test";
import { Logger, pino } from "pino";

describe("BinaryStructure", () => {
    describe(".byteLength", () => {
        it("should have a value of 0", () => {
            // Arrange
            /**  @type {Logger} */
            const log: Logger = mock.fn(pino)();
            const testStructure = new BinaryStructureBase(log);

            // Assert
            expect(testStructure.getByteLength()).toBe(0);
        });
    });
    describe("#serialize", () => {
        it("should throw when passed a byteStream larger then the internal fields array", () => {
            // Arrange
            /**  @type {Logger} */
            const log: Logger = mock.fn(pino)();
            const inputStream = Buffer.from("This is a pretty decent size.");
            const testStructure = new BinaryStructureBase(log);

            // Assert
            expect(() => {
                return testStructure.deserialize(inputStream);
            }).toThrow();
        });
    });
    describe("#get", () => {
        it("should throw when passed a name not found in the internal fields array", () => {
            // Arrange
            /**  @type {Logger} */
            const log: Logger = mock.fn(pino)();
            const testStructure = new BinaryStructureBase(log);

            // Assert
            expect(() => {
                return testStructure.get("someFiled");
            }).toThrow();
        });
    });
});
