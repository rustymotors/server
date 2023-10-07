import { describe, it, expect } from "vitest";
import {
    serializeBool,
    serializeByte,
    serializeWord,
    serializeDWord,
    serializeFloat,
    serializeString,
    deserializeBool,
    deserializeByte,
    deserializeWord,
    deserializeDWord,
    deserializeFloat,
    deserializeString,
    sizeOfBool,
    sizeOfByte,
    sizeOfWord,
    sizeOfDWord,
    sizeOfFloat,
    sizeOfString,
    clamp16,
    clamp32,
} from "./serializationHelpers.js";

describe("serializationHelpers", () => {
    describe("serializeBool()", () => {
        it("should serialize a boolean value", () => {
            // Arrange
            const input = true;
            const expected = Buffer.from([1]);

            // Act
            const actual = serializeBool(input);

            // Assert
            expect(actual).toEqual(expected);
        });

        it("should serialize a boolean value", () => {
            // Arrange
            const input = false;
            const expected = Buffer.from([0]);

            // Act
            const actual = serializeBool(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeBool()", () => {
        it("should deserialize a boolean value", () => {
            // Arrange
            const input = Buffer.from([1]);
            const expected = true;

            // Act
            const actual = deserializeBool(input);

            // Assert
            expect(actual).toEqual(expected);
        });

        it("should deserialize a boolean value", () => {
            // Arrange
            const input = Buffer.from([0]);
            const expected = false;

            // Act
            const actual = deserializeBool(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("sizeOfBool()", () => {
        it("should return the size of a boolean value", () => {
            // Arrange
            const expected = 1;

            // Act
            const actual = sizeOfBool();

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("serializeByte()", () => {
        it("should serialize a byte value", () => {
            // Arrange
            const input = 1;
            const expected = Buffer.from([1]);

            // Act
            const actual = serializeByte(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeByte()", () => {
        it("should deserialize a byte value", () => {
            // Arrange
            const input = Buffer.from([1]);
            const expected = 1;

            // Act
            const actual = deserializeByte(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("sizeOfByte()", () => {
        it("should return the size of a byte value", () => {
            // Arrange
            const expected = 1;

            // Act
            const actual = sizeOfByte();

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("serializeWord()", () => {
        it("should serialize a word value", () => {
            // Arrange
            const input = 1;
            const expected = Buffer.from([0, 1]);

            // Act
            const actual = serializeWord(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeWord()", () => {
        it("should deserialize a word value", () => {
            // Arrange
            const input = Buffer.from([0, 1]);
            const expected = 1;

            // Act
            const actual = deserializeWord(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("sizeOfWord()", () => {
        it("should return the size of a word value", () => {
            // Arrange
            const expected = 2;

            // Act
            const actual = sizeOfWord();

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("serializeDWord()", () => {
        it("should serialize a dword value", () => {
            // Arrange
            const input = 1;
            const expected = Buffer.from([0, 0, 0, 1]);

            // Act
            const actual = serializeDWord(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeDWord()", () => {
        it("should deserialize a dword value", () => {
            // Arrange
            const input = Buffer.from([0, 0, 0, 1]);
            const expected = 1;

            // Act
            const actual = deserializeDWord(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("sizeOfDWord()", () => {
        it("should return the size of a dword value", () => {
            // Arrange
            const expected = 4;

            // Act
            const actual = sizeOfDWord();

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("serializeFloat()", () => {
        it("should serialize a float value", () => {
            // Arrange
            const input = 1;
            const expected = Buffer.from([63, 128, 0, 0]);

            // Act
            const actual = serializeFloat(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeFloat()", () => {
        it("should deserialize a float value", () => {
            // Arrange
            const input = Buffer.from([63, 128, 0, 0]);
            const expected = 1;

            // Act
            const actual = deserializeFloat(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("sizeOfFloat()", () => {
        it("should return the size of a float value", () => {
            // Arrange
            const expected = 4;

            // Act
            const actual = sizeOfFloat();

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("serializeString()", () => {
        it("should serialize a string value", () => {
            // Arrange
            const input = "test";
            const expected = Buffer.from([0, 4, 116, 101, 115, 116]);

            // Act
            const actual = serializeString(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe("deserializeString()", () => {
        it("should deserialize a string value", () => {
            // Arrange
            const input = Buffer.from([0, 4, 116, 101, 115, 116]);
            const expected = "test";

            // Act
            const actual = deserializeString(input);

            // Assert
            expect(actual).toEqual(expected);
        });

        it("should throw an error if the size is bigger than the buffer length - 2", () => {
            // Arrange
            const input = Buffer.from([0, 5, 116, 101, 115, 116]);

            // Act
            const actual = () => deserializeString(input);

            // Assert
            expect(actual).toThrowError(
                "Size is bigger than the buffer length - 2",
            );
        });
    });

    describe("sizeOfString()", () => {
        it("should return the size of a string value", () => {
            // Arrange
            const input = "test";
            const expected = 6;

            // Act
            const actual = sizeOfString(input);

            // Assert
            expect(actual).toEqual(expected);
        });
    });
});

describe("clamp16()", () => {
    it("should clamp a value between 0 and 65535", () => {
        // Arrange
        const input = 65536;
        const expected = 65535;

        // Act
        const actual = clamp16(input);

        // Assert
        expect(actual).toEqual(expected);
    });
});

describe("clamp32()", () => {
    it("should clamp a value between 0 and 4294967295", () => {
        // Arrange
        const input = 4294967296;
        const expected = 4294967295;

        // Act
        const actual = clamp32(input);

        // Assert
        expect(actual).toEqual(expected);
    });
});
