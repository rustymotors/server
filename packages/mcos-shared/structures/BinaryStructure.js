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

/**
 * @exports
 * @class
 * @typedef {object}  ByteField
 * @property {string} name
 * @property {'big' | 'little'} order
 * @property {number} size
 * @property {'u16'} type
 * @property {Buffer} value
 */

export class BinaryStructure {
  /**
     * Total byteLength of all _fields
     * @protected
     */
  _byteLength = 0
  /**
     * @protected
     * @type {ByteField[]}
     */
  _fields = []

  /**
   * Add a {@link ByteField} object to the interanl fields array
   * @protected
   * @param {ByteField} field
   * @memberof BinaryStructure
   */
  _add (field) {
    this._byteLength += field.size
    this._fields.push(field)
  }

  /**
     *
     * Load the internal fields
     * @param {Buffer} byteStream
     * @memberof BinaryStructure
     */
  serialize (byteStream) {
    if (byteStream.byteLength > this._byteLength) {
      throw new Error('There are not enough fields to hold the bytestream. ' +
    'Please slice() the input is you are using part.')
    }
  }

  get byteLength () {
    return this._byteLength
  }
}
