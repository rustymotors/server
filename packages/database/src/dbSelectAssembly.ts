import * as Sentry from "@sentry/node";
import { getSlonik } from "./services/database.js";
import type { TPart } from "./models/Part.js";

export async function dbSelectAssembly(partId: number): Promise<TPart[]> {
    return Sentry.startSpan(
        {
            name: "Select assembly",
            op: "db.query",
            attributes: {
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();

            const rows = await slonik.any(sql.typeAlias("part")`
                WITH RECURSIVE assembly AS (
                    SELECT
                        part_id, parent_part_id, branded_part_id,
                        percent_damage, item_wear, attachment_point_id,
                        owner_id, part_name, repair_cost, scrap_value
                    FROM part
                    WHERE part_id = ${partId}
                      AND parent_part_id IS NULL

                    UNION ALL

                    SELECT
                        p.part_id, p.parent_part_id, p.branded_part_id,
                        p.percent_damage, p.item_wear, p.attachment_point_id,
                        p.owner_id, p.part_name, p.repair_cost, p.scrap_value
                    FROM part p
                    INNER JOIN assembly a ON p.parent_part_id = a.part_id
                )
                SELECT * FROM assembly
            `);

            return rows as TPart[];
        },
    );
}
