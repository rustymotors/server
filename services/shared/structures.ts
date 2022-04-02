
/**
 * Data structure holding Type-Length-Value data
 * @param {Buffer} type
 * @param {Buffer} length 
 * @param {Buffer} value 
 * @param {'BIG' | 'LITTLE'} [endian='BIG']
 */
export class TLVRecord {
  private _endian: "BIG" | "LITTLE";
  private _type: Buffer;
  private _length: Buffer;
  private _value: Buffer;

  constructor(
    type: Buffer,
    length: Buffer,
    value: Buffer,
    endian: "BIG" | "LITTLE" = "BIG"
  ) {
    this._endian = endian;
    this._type = type;
    this._length = length;
    this._value = value;
  }

  /**
   * type
   */
  get type(): number {
    if (this._type.byteLength === 1) {
      return this._type.readInt8();
    }
    if (this._endian === "BIG") {
      return this._type.readInt16BE();
    } else {
      return this._type.readInt16LE();
    }
  }

  /**
   * length
   */
  get length(): number {
    if (this._type.byteLength === 1) {
      return this._length.readInt8();
    }

    if (this._endian === "BIG") {
      return this._length.readInt16BE();
    } else {
      return this._length.readInt16LE();
    }
  }

  /**
   * value
   */
  get value(): Buffer {
    return this._value;
  }

  /**
   * raw
   */
  get raw(): Buffer {
    return Buffer.concat([this._type, this._length, this._value]);
  }

  /**
   * toString
   * TODO: write tests
   */
  public toString(): string {
    return Buffer.concat([this._type, this._length, this._value])
      .toJSON()
      .data.map((i) => i.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * clone
   * TODO: write tests
   */
  public clone(): TLVRecord {
    return new TLVRecord(this._type, this._length, this._value, this._endian);
  }
}

// TODO: Write tests
export class TLVRecordArray {
  private _entries: TLVRecord[] = [];
  /**
   * count
   */
  get count() {
    return this._entries.length;
  }

  /**
   * push
   */
  public push(recordToAdd: TLVRecord): TLVRecord[] {
    this._entries.push(recordToAdd);
    return this._entries;
  }

  /**
   * first
   */
  public first(): TLVRecord | undefined {
    return this._entries[0];
  }
}
