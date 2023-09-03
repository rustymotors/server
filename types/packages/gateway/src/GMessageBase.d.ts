import { Logger } from "pino";
import { BinaryStructureBase } from "../../shared/BinaryStructure.js";
/**
 * @class
 * @extends {BinaryStructure}
 */
export declare class GSMessageBase extends BinaryStructureBase {
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