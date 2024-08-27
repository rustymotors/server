import { describe, expect, it } from "vitest";
import { PersonaRecord } from "../../interfaces/index.js";
import { getPersonasByPersonaId } from "../src/getPersonasByPersonaId.js";

describe("getPersonasByPersonaId", () => {
	it("returns a persona", async () => {
		// arrange
		const personaRecord: PersonaRecord = {
			id: Buffer.alloc(4),
			name: Buffer.from("test"),
			customerId: 6767,
			maxPersonas: Buffer.alloc(4),
			personaCount: Buffer.alloc(4),
			shardId: Buffer.alloc(4),
		};
		const id = 1;

		// act
		const result = await getPersonasByPersonaId({
			personas: [personaRecord],
			id,
		});

		// assert
		expect(result).toBeInstanceOf(Array);
		expect(result[0].id.readInt32BE(0)).toBe(id);
	});
});
