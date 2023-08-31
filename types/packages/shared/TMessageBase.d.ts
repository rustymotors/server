import { Logger } from "../interfaces/index.js";
import { BinaryStructureBase } from "./BinaryStructure.js";
/**
 * @class
 * @extends {BinaryStructureBase}
 */
export declare class TransactionMessageBase extends BinaryStructureBase {
    /**
     * What byte order are the fields?
     * @type {'big' | 'little'}
     */
    _byteOrder: string;
    /**
     * Creates an instance of TSMessageBase.
     * @author Drazi Crendraven
     * @param {Logger} log
     * @memberof TSMessageBase
     */
    constructor(log: Logger);
}
//# sourceMappingURL=TMessageBase.d.ts.map