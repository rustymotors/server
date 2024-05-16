import * as Sentry from '@sentry/node';
import { getDatabase } from '@rustymotors/database';
import { abstractPartType as abstractPartTypeSchema } from '@rustymotors/schema';
import { getServerLogger } from '@rustymotors/shared';

const log = getServerLogger();
export async function populateAbstractPartType(): Promise<void> {
    log.setName('seeders/populateAbstractPartType');

    log.debug('Seeding abstractPartType');

    await getDatabase()
        .insert(abstractPartTypeSchema)
        .values([
            {
                abstractPartTypeId: 101,
                // parentAbstractPartTypeId: null,
                // dependsOn: null,
                // partFilename: null,
                eAPT: 'Vehicle',
                // gAPT: null,
                // fAPT: null,
                // sAPT: null,
                // iAPT: null,
                // jAPT: null,
                // swAPT: null,
                // bAPT: null,
                // modifiedRule: 0,
                // eUT: null,
                // gUT: null,
                // fUT: null,
                // sUT: null,
                // iUT: null,
                // jUT: null,
                // swUT: null,
                // bUT: null,
                // partPaired: 0,
                // schematicPicname1: null,
                // schematicPicname2: "VEH%d",
                // blockFamilyCompatibility: 0,
                // repairCostModifier: 1.0,
                // scrapCostModifier: 1.0,
                // garageCategory: 0,
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug('abstractPartType seeded');
        })
        .catch((error: Error) => {
            log.error(`Error seeding abstractPartType: ${error.message}`);
            Sentry.captureException(error);
        });
}
