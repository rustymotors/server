import { describe, it, expect } from "vitest";
import { PersonaRecord } from "../src/persona/PersonaRecord.js";

describe('PersonaRecord', () => {
    it("has a gameSerialNumber", () => {
        const testSN = '123567962'
        const pr = new PersonaRecord()

        expect(pr.getGameSerialNumber).not.toBe(undefined)
        pr.setGameSerialNumber(testSN)
        expect(pr.getGameSerialNumber()).toBe(testSN)

    });
})