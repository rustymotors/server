import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * One entry in the legacy MCO parts catalog. The original wire format is the
 * raw tab-separated line the legacy client parses; the structured fields are
 * a convenience for server-side consumers.
 *
 *   brandedPartId<TAB>abstractPartTypeId<TAB>modelId<TAB>partGradeId<TAB>partType
 */
export interface PartCatalogRow {
    readonly brandedPartId: number;
    readonly abstractPartTypeId: number;
    readonly modelId: number;
    readonly partGradeId: number;
    readonly partTypeName: string;
    /**
     * The original tab-separated line, preserved verbatim (minus trailing
     * whitespace) so the HTTP catalog endpoint can echo bytes the legacy
     * client expects.
     */
    readonly rawLine: string;
}

/**
 * Read-only view of the parts catalog. Implementations decide where the rows
 * come from (TSV file, DB table, network fetch).
 *
 * The catalog is "read-mostly": the legacy client fetches it at login and at
 * a few points during gameplay. Implementations should cache aggressively.
 */
export interface PartsCatalog {
    /**
     * @param abstractPartTypeId  When provided, returns only rows whose
     *   abstractPartTypeId matches. When omitted, returns all rows in
     *   declaration order.
     */
    getRows(abstractPartTypeId?: number): Promise<readonly PartCatalogRow[]>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default location of the seeded TSV when running from this package's source
 * tree. Resolves relative to the compiled module location so it works for
 * both `tsx`/dev and a built `tsc` output.
 *
 * Module lives at `packages/database/src/services/PartsCatalog.ts` (source)
 * or `packages/database/dist/services/PartsCatalog.js` (compiled). Either
 * way, two levels up from the module's directory is the package root, where
 * `seed/parts-catalog.tsv` lives.
 */
export function defaultPartsCatalogTsvPath(): string {
    return resolve(__dirname, "..", "..", "seed", "parts-catalog.tsv");
}

/**
 * TSV-backed catalog. Reads `seed/parts-catalog.tsv` (or any path passed to
 * the constructor) once on first access, then serves all subsequent reads
 * from an in-memory cache.
 *
 * This is the implementation we ship today. To swap in a DB-backed catalog
 * later, implement {@link PartsCatalog} against the `BrandedPart` /
 * `AbstractPartType` / `PartGrade` tables and have {@link createPartsCatalog}
 * select it via env var — no changes to handlers or the HTTP route required.
 */
export class TsvPartsCatalog implements PartsCatalog {
    private cache: PartCatalogRow[] | null = null;

    constructor(private readonly tsvPath: string) {}

    async getRows(
        abstractPartTypeId?: number,
    ): Promise<readonly PartCatalogRow[]> {
        const rows = this.loadRows();
        if (
            abstractPartTypeId === undefined ||
            !Number.isInteger(abstractPartTypeId) ||
            abstractPartTypeId <= 0
        ) {
            return rows;
        }
        return rows.filter(
            (r) => r.abstractPartTypeId === abstractPartTypeId,
        );
    }

    /** Test/dev hook to force a re-read on next access. */
    invalidate(): void {
        this.cache = null;
    }

    private loadRows(): PartCatalogRow[] {
        if (this.cache !== null) {
            return this.cache;
        }
        const rows: PartCatalogRow[] = [];
        if (!existsSync(this.tsvPath)) {
            this.cache = rows;
            return rows;
        }

        const text = readFileSync(this.tsvPath, "utf8");
        for (const rawLine of text.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (line.length === 0 || line.startsWith("#")) {
                continue;
            }

            const fields = line.split("\t");
            const brandedPartId = Number(fields[0]);
            const abstractPartTypeId = Number(fields[1]);
            // model/grade/name default to safe values when missing — the
            // legacy TSV is well-formed but defensive parsing is cheap.
            const modelId = fields[2] !== undefined ? Number(fields[2]) : 0;
            const partGradeId =
                fields[3] !== undefined ? Number(fields[3]) : 0;
            const partTypeName = fields[4] ?? "";

            if (
                !Number.isInteger(brandedPartId) ||
                !Number.isInteger(abstractPartTypeId)
            ) {
                continue;
            }

            rows.push({
                brandedPartId,
                abstractPartTypeId,
                modelId: Number.isInteger(modelId) ? modelId : 0,
                partGradeId: Number.isInteger(partGradeId) ? partGradeId : 0,
                partTypeName,
                rawLine: line,
            });
        }

        this.cache = rows;
        return rows;
    }
}

let singleton: PartsCatalog | null = null;

/**
 * Returns the configured {@link PartsCatalog} singleton.
 *
 * Source selection (in order of precedence):
 *   1. `MCO_PARTS_CATALOG_SOURCE` env var: `"tsv"` (default) | `"db"`.
 *   2. For the TSV source, `MCO_PARTS_CATALOG_TSV` overrides the file path.
 *
 * The DB-backed implementation is intentionally not yet wired — when ready,
 * add a `DbPartsCatalog` class implementing {@link PartsCatalog} (read from
 * the `BrandedPart` / `AbstractPartType` tables) and add a `case "db":`
 * branch here. Callers won't change.
 */
export function createPartsCatalog(): PartsCatalog {
    if (singleton !== null) {
        return singleton;
    }

    const source = (process.env["MCO_PARTS_CATALOG_SOURCE"] ?? "tsv").toLowerCase();
    switch (source) {
        case "tsv": {
            const tsvPath =
                process.env["MCO_PARTS_CATALOG_TSV"] ??
                defaultPartsCatalogTsvPath();
            singleton = new TsvPartsCatalog(tsvPath);
            return singleton;
        }
        case "db":
            // TODO(parts-catalog-db): implement DbPartsCatalog reading from
            //   the BrandedPart / AbstractPartType / PartGrade tables via
            //   the existing DatabaseManager. Should return rows in
            //   abstractPartTypeId order so the on-the-wire ordering
            //   matches the TSV (the legacy client does not care about
            //   order, but stable order makes diffs sane).
            throw new Error(
                "MCO_PARTS_CATALOG_SOURCE=db is not implemented yet; use the TSV source",
            );
        default:
            throw new Error(
                `Unknown MCO_PARTS_CATALOG_SOURCE: ${source} (expected "tsv" or "db")`,
            );
    }
}

/** Test-only: reset the singleton so a fresh source can be installed. */
export function _resetPartsCatalogForTests(): void {
    singleton = null;
}
