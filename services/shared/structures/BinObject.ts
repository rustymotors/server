export enum EBinaryFieldType {
    STRING,
    NUMBER,
    BOOLEAN
}

export interface IBinaryField {
    name: string,
    type: EBinaryFieldType,
    size: number,
    value: Buffer,
    notes?: string
}
/**
 * Container for binary fields
 *
 * @export
 * @class BinObject
 */
export class BinObject {
    protected _byteOrder: 'big' | 'little' = 'little'
    protected _fields: IBinaryField[] = []
/**
 * Get field by name
 * TODO: Investigate possible intellisense for fields
 * @param {string} fieldname
 * @return {*}  {IBinaryField}
 * @memberof BinObject
 */
public getField(fieldname: string): IBinaryField {
        const selectedField = this._fields.find(field => {
            return field.name === fieldname
        })

        if (typeof selectedField === "undefined") {
            throw new Error(`There was no field located with this name: ${fieldname}`);
            
        }

        return selectedField
    }

}