/**
 * @module mcos/shared
 */
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
 * @param {import("mcos/shared").ELOG_LEVEL} level
 */
export const getLevelValue = (level) => {
    return levelMappings[level];
};

/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @param {import("mcos/shared").ELOG_LEVEL} [logLevel="info"]
 * @returns {import("mcos/shared").TServerLogger}
 */
export function GetServerLogger(logLevel = "info") {
    const defaultLevelValue = getLevelValue(logLevel);
    console.log(defaultLevelValue)

    /**
     * @param {import("mcos/shared").ELOG_LEVEL} level
     * @param {string} msg
     * @returns {void}
     */
    return (level, msg) => {
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
