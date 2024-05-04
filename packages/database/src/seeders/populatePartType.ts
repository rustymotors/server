import { getServerLogger } from "../../../shared";
import { partType as partTypeSchema } from "../../../../schema/partType";
import { getDatabase } from "../services/database";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populatePartType(): Promise<void> {
    log.setName("seeders/populatePartType");

    log.debug("Seeding partType");

    await getDatabase()
        .insert(partTypeSchema)
        .values([
            {
                partTypeId: 101,
                abstractPartTypeId: 101,
                partType: "1932 Ford V-8 Coupe",
                partGradeId: 1,
            },
            {
                partTypeId: 104,
                abstractPartTypeId: 101,
                partType: "1957 Ford Fairlane 500",
                partGradeId: 1,
            },
            {
                partTypeId: 111,
                abstractPartTypeId: 101,
                partType: "1970 Ford Boss 302 Mustang",
                partGradeId: 1,
            },
            {
                partTypeId: 117,
                abstractPartTypeId: 101,
                partType: "1963 Chevy Corvette Stingray",
                partGradeId: 1,
            },
            {
                partTypeId: 125,
                abstractPartTypeId: 101,
                partType: "1959 Cadillac Eldorado Biarritz",
                partGradeId: 1,
            },
            {
                partTypeId: 130,
                abstractPartTypeId: 101,
                partType: "1973 Pontiac Firebird T/A",
                partGradeId: 1,
            },
            {
                partTypeId: 214,
                abstractPartTypeId: 101,
                partType: "1970 Plymouth 440 Cuda",
                partGradeId: 1,
            },
            {
                partTypeId: 228,
                abstractPartTypeId: 101,
                partType: "1973 Pontiac Firebird",
                partGradeId: 1,
            },
            {
                partTypeId: 103,
                abstractPartTypeId: 101,
                partType: "1953 Ford Crestline",
                partGradeId: 1,
            },
            {
                partTypeId: 108,
                abstractPartTypeId: 101,
                partType: "1965 Ford Mustang",
                partGradeId: 1,
            },
            {
                partTypeId: 132,
                abstractPartTypeId: 101,
                partType: "1969 Dodge Charger",
                partGradeId: 1,
            },
            {
                partTypeId: 120,
                abstractPartTypeId: 101,
                partType: "1967 Chevy Camaro",
                partGradeId: 1,
            }
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("PartType seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding partType: ${error.message}`);
            Sentry.captureException(error);
        });
}


