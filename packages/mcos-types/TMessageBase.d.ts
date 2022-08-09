import { BinaryStructure } from "./BinaryStructure.js";
/**
 * @class
 * @extends {BinaryStructure}
 */
export declare class TSMessageBase extends BinaryStructure {
    /**
     * What byte order are the fields?
     * @type {'big' | 'little'}
     */
    _byteOrder: string;
    constructor();
}
