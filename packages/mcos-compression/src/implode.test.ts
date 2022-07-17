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

import { ok, throws} from 'node:assert'
import { describe, it } from 'mocha'
import { implode } from './implode.js'
import { createEmptyTCompStruct } from './testHelpers.js'

describe('MCOSCompress', () => {
  describe('#implode', () => {
    it('should throw an assertion error when "workBuf" is not zero', () => {
      // Arrange
      /** @type {import('./types.js').TCmpStruct} */
      const testWorkBuf: import('./types.js').TCmpStruct = createEmptyTCompStruct()

      // Act
      testWorkBuf.workBuff = Buffer.from([0x01, 0x02, 0x03, 0x04])

      // Assert
      throws(() => {
        implode(Buffer.alloc(0), Buffer.alloc(0), testWorkBuf, Buffer.alloc(0), 0, 0)
      })
    })
    it('should return a number when passed a valid "workBuf', () => {
      // Arrange
      /** @type {import('./types.js').TCmpStruct} */
      const testWorkBuf: import('./types.js').TCmpStruct = createEmptyTCompStruct()

      // Act
      const r = implode(Buffer.alloc(0), Buffer.alloc(0), testWorkBuf, Buffer.alloc(0), 0, 0)

      // Assert
      ok(typeof r.status === 'number')

    })
    it('should compress a data stream')
  })
})
