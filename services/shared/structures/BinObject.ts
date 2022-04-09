export enum EBinaryFieldType {
  STRING,
  NUMBER,
  BOOLEAN,
}

export interface IBinaryField {
  name: string;
  type: EBinaryFieldType;
  size: number;
  value: Buffer;
  notes?: string;
}
/**
 * Container for binary fields
 *
 * @export
 * @class BinObject
 */
export class BinObject {
  protected _byteOrder: "big" | "little" = "little";
  protected _fields: IBinaryField[] = [];
  /**
   * Get field by name
   * TODO: Investigate possible intellisense for fields
   * @param {string} fieldname
   * @return {*}  {IBinaryField}
   * @memberof BinObject
   */
  public getField(fieldname: string): IBinaryField {
    const selectedField = this._fields.find((field) => {
      return field.name === fieldname;
    });

    if (typeof selectedField === "undefined") {
      throw new Error(
        `There was no field located with this name: ${fieldname}`
      );
    }

    return selectedField;
  }
  /**
   * Update field by name with value
   *
   * @param {string} fieldname
   * @param {Buffer} newValue
   * @memberof BinObject
   */
  public updateFieldValue(fieldname: string, newValue: Buffer) {
    this._fields.forEach((field: IBinaryField) => {
      if (field.name === fieldname) {
        if (newValue.byteLength > field.size) {
          throw new Error("Value exceeds field size");
        }

        field.value = Buffer.concat([
          Buffer.alloc(field.size - newValue.byteLength),
          newValue,
        ]);

        if (field.size !== field.value.byteLength) {
          throw new Error(
            "There was an error updating field value. Size mismatch"
          );
        }
        return;
      }
    });
  }
}
