import { BinObject, EBinaryFieldType, IBinaryField } from "./BinObject.js";

describe('BinObject class', function () {
    describe('updateFieldValue()', function () {
        it('should update the value of the field', function () {
            // Arrange
            const binObject = new BinObject()
            const fieldName = 'testField'
            const oldFieldValue = Buffer.from([0x01, 0x02])
            const oldFieldRecord: IBinaryField = {name: fieldName, type: EBinaryFieldType.NUMBER, size: 2, value: oldFieldValue}
            const newFieldValue = Buffer.from([0x03, 0x04])

            // Act
            binObject.addField(oldFieldRecord)
            binObject.updateFieldValue(fieldName, newFieldValue)
            const value = binObject.getField(fieldName).value

            // Assert
            expect(value).toStrictEqual(newFieldValue)

            
        })
    })
})