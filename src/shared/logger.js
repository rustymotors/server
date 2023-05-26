/**
 * @module mcos-shared
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
 * @param {ELOG_LEVEL} level
 */
export const getLevelValue = (level) => {
    switch (level) {
        case "debug":
            return levelMappings.debug;
        case "info":
            return levelMappings.info;
        case "notice":
            return levelMappings.notice;
        case "warning":
            return levelMappings.warning;
        case "err":
            return levelMappings.err;
        case "crit":
            return levelMappings.crit;
        case "alert":
            return levelMappings.alert;
        case "emerg":
            return levelMappings.emerg;
        default:
            return levelMappings.info;
    }
};

/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @param {ELOG_LEVEL} [logLevel="info"]
 * @returns {TServerLogger}
 */
export function getServerLogger(logLevel = "info") {
    const defaultLevelValue = getLevelValue(logLevel);

    /**
     * @param {ELOG_LEVEL} level
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
        ); // skipcq: JS-0002 This is the only place console is used.
    };
}
