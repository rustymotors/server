import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    TsvPartsCatalog,
    createPartsCatalog,
    _resetPartsCatalogForTests,
} from "./PartsCatalog.js";

function makeTempTsv(content: string): { path: string; cleanup: () => void } {
    const dir = mkdtempSync(join(tmpdir(), "parts-catalog-"));
    const path = join(dir, "parts-catalog.tsv");
    writeFileSync(path, content, "utf8");
    return {
        path,
        cleanup: () => rmSync(dir, { recursive: true, force: true }),
    };
}

describe("TsvPartsCatalog", () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
        cleanup?.();
        cleanup = null;
    });

    it("returns an empty list when the TSV file does not exist", async () => {
        const catalog = new TsvPartsCatalog("/nonexistent/path/parts.tsv");
        expect(await catalog.getRows()).toEqual([]);
    });

    it("parses a well-formed catalog with header, blanks, and comments", async () => {
        const tsv =
            "# brandedPartId<TAB>abstractPartTypeId<TAB>modelId<TAB>partGradeId<TAB>partType\n" +
            "\n" +
            "1001\t1001\t2027\t1\tGeneric Chassis Suspension\n" +
            "10001\t10001\t622\t1\t10 x 2 Organic Disc Brake\n" +
            "10002\t10001\t623\t2\t11 x 2 Organic Disc Brake\n" +
            "# trailing comment\n";
        const fixture = makeTempTsv(tsv);
        cleanup = fixture.cleanup;
        const catalog = new TsvPartsCatalog(fixture.path);

        const all = await catalog.getRows();
        expect(all).toHaveLength(3);
        expect(all[0]).toEqual({
            brandedPartId: 1001,
            abstractPartTypeId: 1001,
            modelId: 2027,
            partGradeId: 1,
            partTypeName: "Generic Chassis Suspension",
            rawLine: "1001\t1001\t2027\t1\tGeneric Chassis Suspension",
        });
        expect(all[2]?.brandedPartId).toBe(10002);
        expect(all[2]?.partGradeId).toBe(2);
    });

    it("filters by abstractPartTypeId when provided", async () => {
        const tsv =
            "1001\t1001\t2027\t1\tA\n" +
            "10001\t10001\t622\t1\tB\n" +
            "10002\t10001\t623\t2\tC\n" +
            "20001\t20001\t111\t1\tD\n";
        const fixture = makeTempTsv(tsv);
        cleanup = fixture.cleanup;
        const catalog = new TsvPartsCatalog(fixture.path);

        const tenK = await catalog.getRows(10001);
        expect(tenK.map((r) => r.brandedPartId)).toEqual([10001, 10002]);

        const oneK = await catalog.getRows(1001);
        expect(oneK).toHaveLength(1);

        const missing = await catalog.getRows(99999);
        expect(missing).toEqual([]);
    });

    it("ignores apt filter when value is non-positive or non-integer", async () => {
        const tsv = "1001\t1001\t2027\t1\tA\n";
        const fixture = makeTempTsv(tsv);
        cleanup = fixture.cleanup;
        const catalog = new TsvPartsCatalog(fixture.path);

        expect(await catalog.getRows(0)).toHaveLength(1);
        expect(await catalog.getRows(-5)).toHaveLength(1);
        expect(await catalog.getRows(Number.NaN)).toHaveLength(1);
    });

    it("skips malformed lines without throwing", async () => {
        const tsv =
            "1001\t1001\t2027\t1\tOK\n" +
            "not-a-number\t1001\t1\t1\tBad\n" +
            "1001\tnope\t1\t1\tBad\n" +
            "2001\t2001\n" + // missing trailing fields, still valid header
            "";
        const fixture = makeTempTsv(tsv);
        cleanup = fixture.cleanup;
        const catalog = new TsvPartsCatalog(fixture.path);

        const all = await catalog.getRows();
        expect(all.map((r) => r.brandedPartId)).toEqual([1001, 2001]);
        expect(all[1]?.modelId).toBe(0); // defaulted
        expect(all[1]?.partGradeId).toBe(0);
        expect(all[1]?.partTypeName).toBe("");
    });

    it("caches rows across calls and invalidate() forces a re-read", async () => {
        const fixture = makeTempTsv("1\t1\t1\t1\tA\n");
        cleanup = fixture.cleanup;
        const catalog = new TsvPartsCatalog(fixture.path);

        const first = await catalog.getRows();
        expect(first).toHaveLength(1);

        // Mutate the file behind the cache; cached read should still see 1 row.
        writeFileSync(
            fixture.path,
            "1\t1\t1\t1\tA\n2\t2\t2\t2\tB\n",
            "utf8",
        );
        const second = await catalog.getRows();
        expect(second).toHaveLength(1);

        catalog.invalidate();
        const third = await catalog.getRows();
        expect(third).toHaveLength(2);
    });
});

describe("createPartsCatalog factory", () => {
    const originalSource = process.env["MCO_PARTS_CATALOG_SOURCE"];
    const originalPath = process.env["MCO_PARTS_CATALOG_TSV"];

    beforeEach(() => {
        _resetPartsCatalogForTests();
    });

    afterEach(() => {
        _resetPartsCatalogForTests();
        if (originalSource === undefined) {
            delete process.env["MCO_PARTS_CATALOG_SOURCE"];
        } else {
            process.env["MCO_PARTS_CATALOG_SOURCE"] = originalSource;
        }
        if (originalPath === undefined) {
            delete process.env["MCO_PARTS_CATALOG_TSV"];
        } else {
            process.env["MCO_PARTS_CATALOG_TSV"] = originalPath;
        }
    });

    it("returns a TsvPartsCatalog by default", () => {
        delete process.env["MCO_PARTS_CATALOG_SOURCE"];
        const catalog = createPartsCatalog();
        expect(catalog).toBeInstanceOf(TsvPartsCatalog);
    });

    it("returns the same singleton on repeated calls", () => {
        delete process.env["MCO_PARTS_CATALOG_SOURCE"];
        expect(createPartsCatalog()).toBe(createPartsCatalog());
    });

    it("respects MCO_PARTS_CATALOG_TSV override", async () => {
        const fixture = makeTempTsv("42\t42\t1\t1\tAnswer\n");
        try {
            process.env["MCO_PARTS_CATALOG_SOURCE"] = "tsv";
            process.env["MCO_PARTS_CATALOG_TSV"] = fixture.path;
            const catalog = createPartsCatalog();
            const rows = await catalog.getRows();
            expect(rows).toHaveLength(1);
            expect(rows[0]?.brandedPartId).toBe(42);
        } finally {
            fixture.cleanup();
        }
    });

    it("throws on MCO_PARTS_CATALOG_SOURCE=db until DbPartsCatalog is implemented", () => {
        process.env["MCO_PARTS_CATALOG_SOURCE"] = "db";
        expect(() => createPartsCatalog()).toThrow(/not implemented/);
    });

    it("throws on unknown MCO_PARTS_CATALOG_SOURCE value", () => {
        process.env["MCO_PARTS_CATALOG_SOURCE"] = "redis";
        expect(() => createPartsCatalog()).toThrow(/Unknown MCO_PARTS_CATALOG_SOURCE/);
    });
});
