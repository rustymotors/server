import { BinaryStructureBase } from "./BinaryStructure.js";
import { TServerLogger } from "./interfaces.js";
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
     * @param {TServerLogger} log
     * @memberof TSMessageBase
     */
    constructor(log: TServerLogger);
}
