import { Logger } from "../../interfaces/index.js";
import { BinaryStructure } from "../../shared/index.js";
/**
 * @class
 * @extends {BinaryStructure}
 */
export declare class GSMessageBase extends BinaryStructure {
    /**
     * Creates an instance of GSMessageBase.
     * @author Drazi Crendraven
     * @param {Logger} log
     * @memberof GSMessageBase
     */
    constructor(log: Logger);
    calulateChecksum(): void;
}
//# sourceMappingURL=GMessageBase.d.ts.map