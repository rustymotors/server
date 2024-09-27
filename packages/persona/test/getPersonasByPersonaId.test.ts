import { describe, expect, it } from "vitest";
import { getPersonasByPersonaId } from "../src/getPersonasByPersonaId.js";
import { PersonaRecord } from "../src/PersonaMapsMessage.js";

describe("getPersonasByPersonaId", () => {
	it("returns a persona", async () => {
		// arrange
		const personaRecord: Pick<
		PersonaRecord,
		"customerId" | "personaId" | "personaName" | "shardId"
	> = {
			personaId: 0,
			personaName: "test",
			customerId: 6767,
			shardId: 0,
		};
		const id = 1;

		// act
		const result = await getPersonasByPersonaId({
			personaId: id,
		});

		// assert
		expect(result).toBeInstanceOf(Array);
		expect(result[0].personaId).toBe(id);
	});

	// Mock personaRecords
	const personaRecords: Pick<
	PersonaRecord,
	"customerId" | "personaId" | "personaName" | "shardId"
>[] = [
		{
			personaId: 1111,
			personaName: "test1",
			customerId: 6767,
			shardId: 0,
		},
		{
			personaId: 2222,
			personaName: "test2",
			customerId: 6768,
			shardId: 0,
		},
	];

	describe("getPersonasByPersonaId", () => {
		it("returns a persona when a matching ID is found", async () => {
			// arrange
			const id = 1;

			// act
			const result = await getPersonasByPersonaId({ personaId: id });

			// assert
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);
			expect(result[0].personaId).toBe(id);
		});

		it("throws an error when no matching ID is found", async () => {
			// arrange
			const id = 3;

			// act & assert
			await expect(getPersonasByPersonaId({
				personaId: id,
			})).rejects.toThrow(
				`Unable to locate a persona for id: ${id}`,
			);
		});
	});
});
