export class ServerError extends Error {

    /**  @type {import("mcos/shared").ELOG_LEVEL} */
    level

    
    /**
     * Creates an instance of ServerError.
     * @author Drazi Crendraven
     * @param {import("mcos/shared").ELOG_LEVEL} level
     * @param {string} message
     * @memberof ServerError
     */
    constructor(level, message) {
        super(message)
        this.level = level
    }
}
