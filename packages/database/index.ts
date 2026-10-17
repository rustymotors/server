// Injectable database services (12-factor app pattern)
export { createDatabaseServices, type DatabaseServicesConfig } from "./src/createDatabaseServices.js";
export { SessionStore } from "./src/stores/SessionStore.js";
export { GameDataStore } from "./src/stores/GameDataStore.js";
export { AuthStore } from "./src/stores/AuthStore.js";

// Vehicle part cache utilities (used by transactions package)
export {
    getVehiclePartTree,
    setVehiclePartTree,
    buildVehiclePartTreeFromDB,
    vehiclePartTreeToJSON,
    buildAssemblyPartTreeFromDB,
} from "./src/cache.js";
export type { TPart } from "./src/models/Part.js";

// Parts catalog (read-mostly metadata served to the legacy client over HTTP).
// TSV-backed today; designed to swap to a DB-backed implementation later.
export {
    createPartsCatalog,
    TsvPartsCatalog,
    defaultPartsCatalogTsvPath,
} from "./src/services/PartsCatalog.js";
export type {
    PartsCatalog,
    PartCatalogRow,
} from "./src/services/PartsCatalog.js";

