import { BinaryStructure } from "mcos/shared";
import { TServerLogger } from "mcos/shared/interfaces";
/**
 * @class
 * @extends {BinaryStructure}
 */
export declare class GSMessageBase extends BinaryStructure {
    /**
     * Creates an instance of GSMessageBase.
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     * @memberof GSMessageBase
     */
    constructor(log: TServerLogger);
    calulateChecksum(): void;
}
