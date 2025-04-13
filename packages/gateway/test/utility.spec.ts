import { suite, it, expect } from "vitest";
import { splitPackets } from "../src/utility";

suite("Utility Helpers", () => {
	suite("splitPackets", () => {
		const separator = Buffer.from([0x11, 0x01]);

		it("should return the entire buffer when no seperator is found", () => {
			const data = Buffer.from("0102030405060708090a0b0c0d0e0f10", "hex");
			const expectedPackets = [
				Buffer.from("0102030405060708090a0b0c0d0e0f10", "hex"),
			];

			const result = splitPackets(data, separator);

			expect(result).toEqual(expectedPackets);
		});

		it("should return the entire buffer when the seperator is at the beginning", () => {
			const data = Buffer.from("11010203040f010506070809", "hex");
			const expectedPackets = [Buffer.from("11010203040f010506070809", "hex")];

			const result = splitPackets(data, separator);

			expect(result).toEqual(expectedPackets);
		});

		it("should return packets when a seperator is located at the beginning and in the middle", () => {
			const data = Buffer.from("11010203040f0105110106070809", "hex");
			const expectedPackets: Buffer[] = [
				Buffer.from("11010203040f0105", "hex"),
				Buffer.from("110106070809", "hex"),
			];

			const result = splitPackets(data, separator);

			expect(result).toEqual(expectedPackets);
		});

		it("should throw when a seperator is located at the end", () => {
			const data = Buffer.from("11010203040f01051101060708091101", "hex");

			expect(() => splitPackets(data, separator)).toThrowError(
				"Separator found at the end of the buffer",
			);
		});

		it("should throw when a seperator is located at beginning and multiple times in the middle", () => {
			const data = Buffer.from("11010203040f01051101060708091101", "hex");

			expect(() =>
                splitPackets(data, separator),
            ).toThrowError("Separator found at the end of the buffer");
		});


        it("should return multiple packets when a seperator is located at beginning and multiple times in the middle", () => {
			const data = Buffer.from("11010203040f01051101060708091101ab63", "hex");
			const expectedPackets: Buffer[] = [
				Buffer.from("11010203040f0105", "hex"),
				Buffer.from("110106070809", "hex"),
				Buffer.from("1101ab63", "hex"),
			];

			const result = splitPackets(data, separator);

			expect(result).toEqual(expectedPackets);
		});
	});
});
