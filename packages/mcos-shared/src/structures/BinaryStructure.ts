// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { errorMessage, toHex } from '../index.js'
import { logger } from '../logger/index.js'

const log = logger.child({ service: 'mcos:shared:structures' })

type FIELD_TYPE = 'boolean' | 'binary' | 'byte' | 'char' | 'u16' | 'u32'

/**
 * @class
 * @property {string} name
 * @property {'big' | 'little'} order
 * @property {number} offset
 * @property {number} size
 * @property {FIELD_TYPE} type
 * @property {Buffer} value
 */
export class ByteField {
  /** @type {string} */
  name: string
  /** @type {'big' | 'little'} */
  order: 'big' | 'little'
  /** @type {number} */
  offset: number
  /** @type {number} */
  size: number
  /** @type {FIELD_TYPE} */
  type: FIELD_TYPE
  /** @type {Buffer} */
  value: Buffer
  /**
   * Creates an instance of ByteField.
   * @param {ByteField} newField
   * @memberof ByteField
   */
  constructor (newField: ByteField) {
    this.name = newField.name
    this.order = newField.order
    this.offset = newField.offset
    this.size = newField.size
    this.type = newField.type
    this.value = newField.value
  }
}



export class BinaryStructure {
  /**
   * Holds the next offset to be used when adding a field
   * @protected
   */
  _byteOffset = 0
  /**
     * Total byteLength of all _fields
     * @protected
     */
  _byteLength = 0
  /**
     * @protected
     * @type {ByteField[]}
     */
  _fields : ByteField[]= []

  constructor () {
    log.trace('new BinaryStructure')
  }

  /**
   * Add a {@link ByteField} object to the internal fields array
   * @protected
   * @param {{name: string, order: "big" | "little", size: number, type: FIELD_TYPE, value: Buffer }} field
   * @memberof BinaryStructure
   */
  _add (field: {name: string, order: "big" | "little", size: number, type: FIELD_TYPE, value: Buffer }): void {
    const newField = { ...field, offset: this._byteOffset }
    log.trace(`Adding ${JSON.stringify(newField)}`)
    this._fields.push(newField)
    this._byteLength = this._byteLength + field.size
    this._byteOffset = this._byteOffset + field.size
  }

  /**
     *
     * Return the internal fields
     * @return {Buffer}
     * @memberof BinaryStructure
     */
  serialize (): Buffer {
    let responseBuffer = Buffer.alloc(0)
    this._fields.forEach(f => {
      responseBuffer = Buffer.concat([responseBuffer, f.value])
    })
    return responseBuffer
  }

  /**
   * Load the internal fields
   * @param {Buffer} byteStream
   * @memberof BinaryStructure
   */
  deserialize (byteStream: Buffer): void {
    if (byteStream.byteLength > this._byteLength) {
      const errMessage = 'There are not enough fields to hold the bytestream. ' +
      'Please slice() the input if you are using part.'
      log.error(errMessage)
      throw new Error(errMessage)
    }

    log.debug(`Attempting to deserialize ${byteStream.byteLength} bytes into ${this._fields.length} fields for a total of ${this._byteLength} bytes`)

    this._fields.forEach(f => {
      log.trace(`Before: ${JSON.stringify(f)}`)
      const indexes = { start: f.offset, end: f.offset + f.size }
      log.trace(`Taking data: ${JSON.stringify(indexes)}`)
      const value = byteStream.slice(indexes.start, indexes.end)
      log.debug(`Setting ${f.name} with value of ${toHex(value)}, size ${value.byteLength}`)
      f.value = value
      log.trace(`After: ${JSON.stringify(f)}`)
      this._byteOffset = indexes.end
    })
  }

  get byteLength (): number {
    return this._byteLength
  }

  /**
   * Return field by name
   * @param {string} fieldName
   * @return {ByteField}
   * @memberof BinaryStructure
   */
  get (fieldName: string): ByteField {
    const selectedField = this._fields.find(f => {
      return f.name === fieldName
    })
    if (typeof selectedField === 'undefined') {
      throw new Error(`No field found with name: ${fieldName}`)
    }
    return selectedField
  }

  /**
   *
   *
   * @param {string} fieldName
   * @memberof BinaryStructure
   */
  getValue (fieldName: string): string | number | boolean {
    log.trace('Calling get() in BinaryStructure..')
    const selectedField = this.get(fieldName)
    log.trace('Calling get() in BinaryStructure.. success')
    const { type, order, value } = selectedField
    log.debug(`Getting a value of ${toHex(value)} from the ${selectedField.name} field with type of ${type} and size of (${value.byteLength},${selectedField.size})`)
    try {
      if (type === 'boolean') {
        if (value.readInt8() === 0) {
          return false
        }
        return true
      }
      if (type === 'char') {
        return value.toString('utf8')
      }
      if (type === 'u16') {
        if (order === 'big') {
          return value.readUInt16BE()
        }
        return value.readUInt16LE()
      }
      if (type === 'u32') {
        if (order === 'big') {
          return value.readUInt32BE()
        }
        return value.readUInt32LE()
      }
      return value.readUInt8()
    } catch (error) {
      log.trace('Calling get() in BinaryStructure.. fail!')
      const errMessage = `Error in getValueX: ${errorMessage(error)}: ${fieldName}, ${type}, ${order}, ${selectedField.size}, ${value.byteLength}, ${value}`
      throw new Error(errMessage)
    }
  }

  /**
   *
   * @param {string} fieldName
   * @param {number} newValue
   * @returns
   */
  setValueNumber (fieldName: string, newValue: number): void {
    log.trace('Calling setValueNumber() in BinaryStructure..')
    const selectedField = this.get(fieldName)
    log.trace('Calling get() in BinaryStructure.. success')
    let { type, order, value } = selectedField
    log.debug(`Setting a value of ${newValue} to the ${selectedField.name} field with type of ${type})`)
    try {
      if (type === 'boolean') {
        if (newValue === 1 || newValue === 0) {
          value.writeInt8(newValue)
          return
        }
        const errMessage = `Value must be 0 or 1 for a boolean type`
        log.error(errMessage)
        throw new Error(errMessage)
      }
      if (type === 'u16') {
        if (order === 'big') {
          value.writeUInt16BE(newValue)
          return
        }
        value.writeUInt16LE(newValue)
        return
      }
      if (type === 'u32') {
        if (order === 'big') {
          value.writeUInt32BE(newValue)
          return
        }
        value.writeUInt32LE(newValue)
        return
      }
      const errMessage = `${selectedField.name} is not a number. It is type ${selectedField.type}`
      log.error(errMessage)
      throw new Error(errMessage)

    } catch (error) {
      log.trace('Calling get() in BinaryStructure.. fail!')
      const errMessage = `Error in newValueNumber: ${errorMessage(error)}: ${fieldName}, ${type}, ${order}, ${selectedField.size}, ${value.byteLength}, ${newValue}`
      throw new Error(errMessage)
    }
  }
}
