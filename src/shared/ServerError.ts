import { ELOG_LEVEL } from "mcos/shared";

export class ServerError extends Error {
    /**  @type {ELOG_LEVEL} */
    level: ELOG_LEVEL;

    /**
     * Creates an instance of ServerError.
     * @author Drazi Crendraven
     * @param {ELOG_LEVEL} level
     * @param {string} message
     * @memberof ServerError
     */
    constructor(level: ELOG_LEVEL, message: string) {
        super(message);
        this.level = level;
    }
}
