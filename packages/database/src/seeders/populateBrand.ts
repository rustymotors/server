import { getServerLogger } from "rusty-motors-shared";
import { brand as brandSchema } from "../../../../schema/brand.js";
import { getDatabase } from "../services/database.js";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateBrand(): Promise<void> {
    log.setName("seeders/populateBrand");

    log.debug("Seeding brand");

    await getDatabase()
        .insert(brandSchema)
        .values([
            {
                brandId: 1,
                brand: "Ford",
                picName: "ford",
                isStock: 9,
            },
            {
                brandId: 2,
                brand: "Mercury",
                picName: "merc",
                isStock: 9,
            },
            {
                brandId: 3,
                brand: "Chevrolet",
                picName: "chev",
                isStock: 9,
            },
            {
                brandId: 4,
                brand: "Cadillac",
                picName: "cadi",
                isStock: 9,
            },
            {
                brandId: 5,
                brand: "Oldsmobile",
                picName: "olds",
                isStock: 9,
            },
            {
                brandId: 6,
                brand: "Buick",
                picName: "buic",
                isStock: 9,
            },
            {
                brandId: 7,
                brand: "Pontiac",
                picName: "pont",
                isStock: 9,
            },
            {
                brandId: 8,
                brand: "Chrysler",
                picName: "chry",
                isStock: 9,
            },
            {
                brandId: 9,
                brand: "Dodge",
                picName: "dodg",
                isStock: 9,
            },
            {
                brandId: 10,
                brand: "Plymouth",
                picName: "plym",
                isStock: 9,
            },
            {
                brandId: 11,
                brand: "AMC",
                picName: "amer",
                isStock: 9,
            },
            {
                brandId: 12,
                brand: "AMC",
                picName: null,
                isStock: 9,
            },
            {
                brandId: 13,
                brand: "Edelbrock",
                picName: "edel",
                isStock: 9,
            },
            {
                brandId: 14,
                brand: "Holley",
                picName: "holl",
                isStock: 9,
            },
            {
                brandId: 15,
                brand: "GM",
                picName: "gm",
                isStock: 9,
            },
            {
                brandId: 16,
                brand: "Rochester",
                picName: "roch",
                isStock: 9
            }
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("Brand seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding brand: ${error.message}`);
            Sentry.captureException(error);
        });
}

