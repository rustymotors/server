/**
 * @class
 * @extends {BinaryStructure}
 */
export class GSMessageBase extends BinaryStructure {
    /**
     * What byte order are the fields?
     * @type {'big' | 'little'}
     */
    _byteOrder: 'big' | 'little';
}
/**
 * @class
 * @extends {BinaryStructure}
 */
export class TSMessageBase extends BinaryStructure {
    /**
     * What byte order are the fields?
     * @type {'big' | 'little'}
     */
    _byteOrder: 'big' | 'little';
}
import { BinaryStructure } from "./BinaryStructure.js";
//# sourceMappingURL=MessageBase.d.ts.map