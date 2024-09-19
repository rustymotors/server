import { describe, it, expect } from "vitest";
import { ClientConnectionMessage } from "./ClientConnectMessage";

describe("ClientConnectionMessage", () => {
	it("should deserialize the data correctly", () => {
		// arrange
		const size = 40;
		const data = Buffer.alloc(size);
		data.writeUInt16LE(123, 0); // messageId
		data.writeUInt32LE(456, 2); // customerId
		data.writeUInt32LE(789, 6); // personaId
		data.write("Test Customer", 10, 13, "ascii"); // customerName
		data.write("Test Persona", 23, 13, "ascii"); // personaName
		data.writeUInt32LE(1, 36); // clientVersion

		const message = new ClientConnectionMessage(size);

		// act
		const result = message.deserialize(data);

		// assert
		expect(result).toBeInstanceOf(ClientConnectionMessage);
		expect(result.getByteSize()).toBe(size);
		expect(result.getMessageId()).toBe(123);
		expect(result.getCustomerId()).toBe(456);
		expect(result.getPersonaId()).toBe(789);
		expect(result.getCustomerName()).toBe("Test Customer");
		expect(result.getPersonaName()).toBe("Test Persona");
		expect(result.getClientVersion()).toBe(1);
	});

	it("should throw an error if there is not enough data to deserialize", () => {
		// arrange
		const size = 40;
		const data = Buffer.alloc(size - 1); // less than required size
		const message = new ClientConnectionMessage(size);

		// act/assert
		expect(() => message.deserialize(data)).toThrowError();
	});
});
