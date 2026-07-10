import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TPart } from "../src/models/Part.js";

const mockAny = vi.hoisted(() => vi.fn());

vi.mock("../src/services/database.js", () => {
    const sql = Object.assign(
        (_strings: TemplateStringsArray, ..._values: unknown[]) => ({}),
        {
            typeAlias: (_name: string) => (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
        },
    );
    return {
        getSlonik: vi.fn().mockResolvedValue({ slonik: { any: mockAny }, sql }),
        getDatabase: vi.fn(),
    };
});

import { dbSelectAssembly } from "../src/dbSelectAssembly.js";

beforeEach(() => {
    mockAny.mockReset();
});

const rootPart: TPart = {
    part_id: 1, parent_part_id: null, branded_part_id: 100,
    percent_damage: 0, item_wear: 0, attachment_point_id: null,
    owner_id: 42, part_name: null, repair_cost: 0, scrap_value: 0,
};
const level1Part: TPart = {
    part_id: 2, parent_part_id: 1, branded_part_id: 101,
    percent_damage: 10, item_wear: 5, attachment_point_id: 1,
    owner_id: 42, part_name: null, repair_cost: 50, scrap_value: 10,
};
const level2Part: TPart = {
    part_id: 3, parent_part_id: 2, branded_part_id: 102,
    percent_damage: 0, item_wear: 0, attachment_point_id: 2,
    owner_id: 42, part_name: null, repair_cost: 20, scrap_value: 5,
};

describe("dbSelectAssembly", () => {
    it("returns all parts from the recursive CTE result", async () => {
        mockAny.mockResolvedValue([rootPart, level1Part, level2Part]);

        const result = await dbSelectAssembly(1);

        expect(result).toHaveLength(3);
        expect(result.map((p) => p.part_id)).toEqual([1, 2, 3]);
    });

    it("returns empty array when partId is not a root part", async () => {
        mockAny.mockResolvedValue([]);

        const result = await dbSelectAssembly(2);

        expect(result).toHaveLength(0);
    });

    it("passes the partId into the query", async () => {
        mockAny.mockResolvedValue([rootPart]);

        await dbSelectAssembly(99);

        expect(mockAny).toHaveBeenCalledOnce();
        const queryArg = mockAny.mock.calls[0][0];
        expect(queryArg.values).toContain(99);
    });
});
