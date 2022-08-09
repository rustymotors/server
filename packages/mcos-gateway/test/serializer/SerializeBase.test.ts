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

import { expect } from "chai";
import { SerializeBase } from "../../src/serializer/SerializeBase.js";

describe("SerializeBase", function () {
    describe("#Word", function () {
        describe("has a from() method", function () {
            it("that returns a Word object", function () {
                // arrange
                const inputNumber = 0;
                const expectedInstanceTYpe = SerializeBase.Word;

                // act
                const result = SerializeBase.Word.from(inputNumber);

                // assert
                expect(result).is.instanceOf(expectedInstanceTYpe);
            });

            it("that throws when passed too small a number", function () {
                // arrange
                const inputNumber = -1;
                const expectedErrorMessage =
                    "value must be between 0 and 65535";

                // act
                expect(() => SerializeBase.Word.from(inputNumber)).throws(
                    expectedErrorMessage
                );
            });

            it("that throws when passed too large a number", function () {
                // arrange
                const inputNumber = 8675309;
                const expectedErrorMessage =
                    "value must be between 0 and 65535";

                // act
                expect(() => SerializeBase.Word.from(inputNumber)).throws(
                    expectedErrorMessage
                );
            });
        });
    });

    describe("#DWord", function () {
        describe("has a from() method", function () {
            it("that returns a DWord object", function () {
                // arrange
                const inputNumber = 8675309;
                const expectedInstanceTYpe = SerializeBase.DWord;

                // act
                const result = SerializeBase.DWord.from(inputNumber);

                // assert
                expect(result).is.instanceOf(expectedInstanceTYpe);
            });

            it("that throws when passed too small a number", function () {
                // arrange
                const inputNumber = -1;
                const expectedErrorMessage =
                    "value must be between 0 and 4294967295";

                // act
                expect(() => SerializeBase.DWord.from(inputNumber)).throws(
                    expectedErrorMessage
                );
            });

            it("that throws when passed too large a number", function () {
                // arrange
                const inputNumber = 12345678910;
                const expectedErrorMessage =
                    "value must be between 0 and 4294967295";

                // act
                expect(() => SerializeBase.DWord.from(inputNumber)).throws(
                    expectedErrorMessage
                );
            });
        });
    });
});

// const b = SerializeBase.Word.from(9230);
// console.log(b.asNumber());

// const d = DWord.from(142893037);
// console.log(d.asNumber());
