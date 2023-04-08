/**
 * @module mcos/shared
 */
import { hostname } from "node:os";
import Sentry from "@sentry/node";

Sentry.init({
    dsn: "https://9cefd6a6a3b940328fcefe45766023f2@o1413557.ingest.sentry.io/4504406901915648",

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
});

/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @param {import("mcos/shared").ELOG_LEVEL} [logLevel="info"]
 * @returns {import("mcos/shared").TServerLogger}
 */
export function GetServerLogger(logLevel = "info") {
    /**
     * @param {'info' | 'error'} level
     * @param {string} msg
     * @returns {string}
     */

    const formatMsg = (level, msg) => {
        return `{"level": "${level}", "hostname": "${hostname}", "message": ${msg}`;
    };

    return {
        /**
         * @param {string} msg
         */
        info: (msg) => {
            console.log(formatMsg("info", msg)); // skipcq: JS-0002
        },
        /**
         * @param {Error} err
         */
        error: (err) => {
            Sentry.captureException(err);
            console.error(formatMsg("error", err.message));
        },
    };
}
