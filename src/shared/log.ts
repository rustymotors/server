/**
 * @module mcos/shared
 */
import type { ELOG_LEVEL, TServerLogger } from "mcos/shared";
import { hostname } from "node:os";

// Per syslog.conf(5)
const levelMappings = {
    debug: 7,
    info: 6,
    notice: 5,
    warning: 4,
    err: 3,
    crit: 2,
    alert: 1,
    emerg: 0,
};

/**
 *
 *
 * @author Drazi Crendraven
 * @param {ELOG_LEVEL} level
 */
export const getLevelValue = (level: ELOG_LEVEL) => {
    return levelMappings[level];
};

/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @param {ELOG_LEVEL} [logLevel="info"]
 * @returns {TServerLogger}
 */
export function getServerLogger(logLevel: ELOG_LEVEL = "info"): TServerLogger {
    const defaultLevelValue = getLevelValue(logLevel);

    /**
     * @param {ELOG_LEVEL} level
     * @param {string} msg
     * @returns {void}
     */
    return (level: ELOG_LEVEL, msg: string): void => {
        const levelValue = getLevelValue(level);
        if (levelValue > defaultLevelValue) {
            return;
        }
        console.log(
            "debug",
            `{"level": "${level}", "hostname": "${hostname}", "message": ${msg}`
        );
    };
}
