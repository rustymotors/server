import { describe, it } from "mocha";
import { expect } from "chai";
import { MessagePacket } from "../index.js";


describe("MessagePacket class", function () {
    it("should return an instance of MessagePacket when the status method fromBuffer() is called", function () {
        // arrange
        const inputBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);

        // act
        const newMessagePacket = MessagePacket.fromBuffer(inputBuffer);

        // assert
        expect(newMessagePacket).instanceOf(MessagePacket);
    });

    it("should return it's internal buffer when the buffer property is accessed", function () {
        // arrange
        const inputBuffer = Buffer.from([0x03, 0x04, 0x05, 0x06]);
        const expectedBuffer = Buffer.from([0x03, 0x04, 0x05, 0x06]);

        // act
        const newMessagePacket = MessagePacket.fromBuffer(inputBuffer);
        const buffer = newMessagePacket.getBuffer();

        // assert
        expect(buffer).deep.equal(expectedBuffer);
    });
});
