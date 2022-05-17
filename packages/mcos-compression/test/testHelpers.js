// mcos-compression is a compression library, written from scratch, that attempts
// to duplicate the functionality of PKWARE DCL Explode (6)
// Copyright (C) <2022>  <Drazi Crendraven>
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
 * @description
 * @author Drazi Crendraven
 * @date 16/05/2022
 * @export
 * @returns {import('./types.js').TCmpStruct}
 */
export function createEmptyTCompStruct () {
  /** @type {import('./types.js').TCmpStruct} */
  return {
    offs0000: Buffer.alloc(0),
    offs2C34: Buffer.alloc(0),
    offs2E34: Buffer.alloc(0),
    offs2EB4: Buffer.alloc(0),
    offs3D34: Buffer.alloc(0),
    outBuff: Buffer.alloc(0),
    outputPos: Buffer.alloc(0),
    ctype: Buffer.alloc(0),
    ChBitsAsc: Buffer.alloc(0),
    LenBase: Buffer.alloc(0),
    LenBits: Buffer.alloc(0),
    LengthCodes: Buffer.alloc(0),
    dSizeMask: Buffer.alloc(0),
    dsizeBits: Buffer.alloc(0),
    bitBuff: Buffer.alloc(0),
    inBuff: Buffer.alloc(0),
    inBytes: Buffer.alloc(0),
    inPos: Buffer.alloc(0),
    DistBits: Buffer.alloc(0),
    ExLenBits: Buffer.alloc(0),
    extraBits: Buffer.alloc(0),
    param: Buffer.alloc(0),
    DistPosCodes: Buffer.alloc(0)
    // readBuf: function () {},
    // writeBuf: function () {}
  }
}
