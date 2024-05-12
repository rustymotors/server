import { getServerLogger } from "rusty-motors-shared";
import { model as modelSchema } from "../../../../schema/model.js";
import { getDatabase } from "../services/database.js";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateModel(): Promise<void> {
    log.setName("seeders/populateModel");

    log.debug("Seeding model");

    await getDatabase()
        .insert(modelSchema)
        .values([
            {
                modelId: 20,
                brandId: 1,
                eModel: "Firebird T/A",
                eExtraInfo: "a/t",
                eShortModel: "Firebird",
                debug_string: "1973 Pontiac Firebird T/A",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 21,
                brandId: 1,
                eModel: "Fairlane",
                eExtraInfo: "a/t",
                eShortModel: "Fairlane",
                debug_string: "Ford 57 Fairlane 500",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 36,
                brandId: 1,
                eModel: "Boss 302",
                eExtraInfo: "a/t",
                eShortModel: "Boss 302",
                debug_string: "Ford 70 Mustang Boss 302",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 26,
                brandId: 3,
                eModel: "Stingray",
                eExtraInfo: "a/t",
                eShortModel: "Stingray",
                debug_string: "Chevrolet 63 Stingray",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 9,
                brandId: 4,
                eModel: "Eldorado",
                eExtraInfo: "a/t",
                eShortModel: "Eldorado",
                debug_string: "Cadillac 59 Eldorado",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2183,
                brandId: 10,
                eModel: "Hemi Cuda",
                eExtraInfo: "a/t",
                eShortModel: "Hemi Cuda",
                debug_string: "Plymouth 70 Hemi Cuda",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2197,
                brandId: 7,
                eModel: "Firebird",
                eExtraInfo: "a/t",
                eShortModel: "Firebird",
                debug_string: "Pontiac 73 Firebird",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2371,
                brandId: 1,
                eModel: "Crestline",
                eExtraInfo: "a/t",
                eShortModel: "Crestline",
                debug_string: "Super Vic (arcade)",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2377,
                brandId: 1,
                eModel: "Mustang",
                eExtraInfo: "a/t",
                eShortModel: "Mustang",
                debug_string: "1964 Ford Mustang modified for arcade Street Racing",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2382,
                brandId: 9,
                eModel: "Charger",
                eExtraInfo: null,
                eShortModel: "Charger",
                debug_string: "1969 Dodge Charger modified for arcade Street Racing",
                debug_sort_string: "Vehicle",
            },
            {
                modelId: 2387,
                brandId: 3,
                eModel: "Camaro",
                eExtraInfo: null,
                eShortModel: "Camaro",
                debug_string: "1967 Chevrolet Camaro modified for arcade Street Racing",
                debug_sort_string: "Vehicle",
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("Model seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding model: ${error.message}`);
            Sentry.captureException(error);
        });
}


