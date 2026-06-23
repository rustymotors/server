import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { TPart } from "../src/models/Part.js";

vi.mock("../src/services/database.js", () => ({
    getSlonik: vi.fn(),
    getDatabase: vi.fn(),
}));

vi.mock("../src/DatabaseManager.js", () => ({
    getDatabaseManager: vi.fn(),
}));

vi.mock("@sentry/node", () => ({
    startSpan: vi.fn((_opts: unknown, fn: () => unknown) => fn()),
}));

vi.mock("rusty-motors-shared", () => ({
    getServerLogger: () => ({
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }),
}));

import * as dbSelectAssemblyModule from "../src/dbSelectAssembly.js";
import { buildAssemblyPartTreeFromDB } from "../src/cache.js";

const rootPart: TPart = {
    part_id: 10,
    parent_part_id: null,
    branded_part_id: 200,
    percent_damage: 0,
    item_wear: 0,
    attachment_point_id: null,
    owner_id: 7,
    part_name: null,
    repair_cost: 0,
    scrap_value: 0,
};

const level1a: TPart = {
    part_id: 11,
    parent_part_id: 10,
    branded_part_id: 201,
    percent_damage: 5,
    item_wear: 1,
    attachment_point_id: 1,
    owner_id: 7,
    part_name: null,
    repair_cost: 30,
    scrap_value: 5,
};

const level1b: TPart = {
    part_id: 12,
    parent_part_id: 10,
    branded_part_id: 202,
    percent_damage: 0,
    item_wear: 0,
    attachment_point_id: 2,
    owner_id: 7,
    part_name: null,
    repair_cost: 40,
    scrap_value: 8,
};

const level2a: TPart = {
    part_id: 21,
    parent_part_id: 11,
    branded_part_id: 211,
    percent_damage: 0,
    item_wear: 0,
    attachment_point_id: 3,
    owner_id: 7,
    part_name: null,
    repair_cost: 10,
    scrap_value: 2,
};

const level2b: TPart = {
    part_id: 22,
    parent_part_id: 12,
    branded_part_id: 212,
    percent_damage: 0,
    item_wear: 0,
    attachment_point_id: 4,
    owner_id: 7,
    part_name: null,
    repair_cost: 15,
    scrap_value: 3,
};

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    spy = vi.spyOn(dbSelectAssemblyModule, "dbSelectAssembly");
});

afterEach(() => {
    spy.mockRestore();
});

describe("buildAssemblyPartTreeFromDB", () => {
    it("populates root metadata from the root part", async () => {
        spy.mockResolvedValue([rootPart, level1a, level1b, level2a, level2b]);

        const tree = await buildAssemblyPartTreeFromDB(10);

        expect(tree.partId).toBe(10);
        expect(tree.brandedPartId).toBe(200);
        expect(tree.ownerID).toBe(7);
        expect(tree.parentPartId).toBeNull();
    });

    it("partitions level1 parts as direct children of root", async () => {
        spy.mockResolvedValue([rootPart, level1a, level1b, level2a, level2b]);

        const tree = await buildAssemblyPartTreeFromDB(10);

        expect(tree.partTree.level1.parts).toHaveLength(2);
        expect(tree.partTree.level1.parts.map((p) => p.part_id)).toEqual(
            expect.arrayContaining([11, 12]),
        );
    });

    it("partitions level2 parts as children of level1 parts", async () => {
        spy.mockResolvedValue([rootPart, level1a, level1b, level2a, level2b]);

        const tree = await buildAssemblyPartTreeFromDB(10);

        expect(tree.partTree.level2.parts).toHaveLength(2);
        expect(tree.partTree.level2.parts.map((p) => p.part_id)).toEqual(
            expect.arrayContaining([21, 22]),
        );
    });

    it("throws when dbSelectAssembly returns empty (non-root partId)", async () => {
        spy.mockResolvedValue([]);

        await expect(buildAssemblyPartTreeFromDB(99)).rejects.toThrow(
            "does not exist or is not a root part",
        );
    });

    it("throws when there are no level1 parts", async () => {
        spy.mockResolvedValue([rootPart]);

        await expect(buildAssemblyPartTreeFromDB(10)).rejects.toThrow(
            "has no parts",
        );
    });

    it("throws when there are no level2 parts", async () => {
        spy.mockResolvedValue([rootPart, level1a, level1b]);

        await expect(buildAssemblyPartTreeFromDB(10)).rejects.toThrow(
            "has no level 2 parts",
        );
    });
});
