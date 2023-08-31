import { ELOG_LEVEL, Logger } from "../interfaces/index.js";
/**
 *
 *
 * @author Drazi Crendraven
 * @param {ELOG_LEVEL} level
 */
export declare const getLevelValue: (level: ELOG_LEVEL) => number;
/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @param {ELOG_LEVEL} [logLevel="info"]
 * @returns {Logger}
 */
export declare function getServerLogger(logLevel?: ELOG_LEVEL): Logger;
//# sourceMappingURL=log.d.ts.map