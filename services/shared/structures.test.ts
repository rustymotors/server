import { TLVRecord, TLVRecordArray } from "./structures";

describe("TLVRecord", () => {
  test("type property should return a number when field length is 1", () => {
    // Arrange
    const expectedType = 4;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.type).toEqual(expectedType);
  });

  test("type property should return a number when field length is 2 and endian is not specified", () => {
    // Arrange
    const expectedType = 17444;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x44, 0x24]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.type).toEqual(expectedType);
  });

  test("type property should return a number when field length is 2 and endian is 'BIG", () => {
    // Arrange
    const expectedType = 17444;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x44, 0x24]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07]),
      "BIG"
    );

    // Assert
    expect(tlv.type).toEqual(expectedType);
  });

  test("type property should return a number when field length is 2 and endian is 'LITTLE", () => {
    // Arrange
    const expectedType = 17444;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x24, 0x44]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07]),
      "LITTLE"
    );

    // Assert
    expect(tlv.type).toEqual(expectedType);
  });

  // --- Length ---

  test("length() should return a number when field length is 1", () => {
    // Arrange
    const expectedLength = 12;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x0c]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.length).toEqual(expectedLength);
  });

  test("length() should return a number when field length is 2 and endian is not specified", () => {
    // Arrange
    const expectedLength = 16648;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x44, 0x24]),
      Buffer.from([0x41, 0x08]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.length).toEqual(expectedLength);
  });

  test("length() should return a number when field length is 2 and endian is 'BIG", () => {
    // Arrange
    const expectedLength = 16648;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x44, 0x24]),
      Buffer.from([0x41, 0x08]),
      Buffer.from([0x01, 0x02, 0x03, 0x07]),
      "BIG"
    );

    // Assert
    expect(tlv.length).toEqual(expectedLength);
  });

  test("length() should return a number when field length is 2 and endian is 'LITTLE", () => {
    // Arrange
    const expectedLength = 16648;

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x24, 0x44]),
      Buffer.from([0x08, 0x41]),
      Buffer.from([0x01, 0x02, 0x03, 0x07]),
      "LITTLE"
    );

    // Assert
    expect(tlv.length).toEqual(expectedLength);
  });

  // --- value ---

  test("value property should return a Buffer", () => {
    // Arrange
    const expectedValue = Buffer.from([0x01, 0x02, 0x03, 0x07]);

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.value).toEqual(expectedValue);
  });

  // --- raw ---

  test("raw property should return a Buffer", () => {
    // Arrange
    const expectedRaw = Buffer.from([0x04, 0x12, 0x01, 0x02, 0x03, 0x07]);

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.raw).toEqual(expectedRaw);
  });

  // --- toString() ---

  test("toString() should return a Buffer", () => {
    // Arrange
    const expectedString = "041201020307";

    // Act
    const tlv = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Assert
    expect(tlv.toString()).toEqual(expectedString);
  });

  // --- clone() ---

  test("clone() should return a TLVRecord equal to the original, but not the same object", () => {
    // Arrange
    const tlvFrom = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    // Act
    const tlvTo = tlvFrom.clone();

    // Assert
    expect(tlvFrom === tlvFrom).toBeTruthy();
    expect(tlvTo === tlvFrom).toBeFalsy();
    expect(tlvTo).toStrictEqual(tlvFrom);
  });
});

describe("TLVRecordArray", () => {
  test("count property should return zero on a fresh object", () => {
    // Arrange
    const expectedCount = 0;

    // Act
    const newRecordArray = new TLVRecordArray();

    // Assert
    expect(newRecordArray.count).toEqual(expectedCount);
  });

  test("first() should return undefined on a fresh object", () => {
    // Arrange
    const expectedFirst = undefined;

    // Act
    const newRecordArray = new TLVRecordArray();

    // Assert
    expect(newRecordArray.first()).toEqual(expectedFirst);
  });

  test("push() should return an array of records including the added one", () => {
    // Arrange
    const tlv0 = new TLVRecord(
      Buffer.from([0x04]),
      Buffer.from([0x12]),
      Buffer.from([0x01, 0x02, 0x03, 0x07])
    );

    const tlv1 = new TLVRecord(
      Buffer.from([0x05]),
      Buffer.from([0x14]),
      Buffer.from([0x08, 0x0a, 0x06, 0x0f])
    );

    const expectedEntries = [tlv0, tlv1];

    // Act
    const newRecordArray = new TLVRecordArray();
    newRecordArray.push(tlv0);

    // Assert
    expect(newRecordArray.push(tlv1)).toEqual(expectedEntries);
  });
});
