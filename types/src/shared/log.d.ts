import { ELOG_LEVEL, TServerLogger } from "./interfaces.js";
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
 * @returns {TServerLogger}
 */
export declare function getServerLogger(logLevel?: ELOG_LEVEL): TServerLogger;
