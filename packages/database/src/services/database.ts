import createConnectionPool, { sql } from '@databases/pg';
import tables from '@databases/pg-typed';
import type DatabaseSchema from '../__generated__/index.js';
const DatabaseSchema = await import('../__generated__/schema.json');

export { sql };

export const db = createConnectionPool(process.env['DATABASE_URL']);

// You can list whatever tables you actually have here:
export const {
    abstract_part_type: AbstractPartTypeSchema,
    attachment_point: AttachmentPointSchema,
    brand: BrandSchema,
    branded_part: BrandedPartSchema,
    driver_class: DriverClassSchema,
    model: ModelSchema,
    part: PartSchema,
    part_grade: PartGradeSchema,
    part_type: PartTypeSchema,
    player: PlayerSchema,
    player_type: PlayerTypeSchema,
    pt_skin: PlayerTypeSkinSchema,
    skin_type: SkinTypeSchema,
    stock_assembly: StockAssemblySchema,
    stock_vehicle_attributes: StockVehicleAttributesSchema,
    sva_car_class: StockVehicleAttributesCarClassSchema,
    sva_mode_restriction: StockVehicleAttributesModeRestrictionSchema,
    vehicle: VehicleSchema,
    warehouse: WarehouseSchema,
    login: LoginSchema,
    profile: ProfileSchema,
} = tables<DatabaseSchema>({
    databaseSchema: DatabaseSchema.default,
});
export type { DatabaseSchema };
