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

import chai from 'chai'
import { GLoginMsg } from 'mcos-login/messages'
import { describe, it } from 'mocha'

chai.should()

describe('GLoginMsg', () => {
  describe('.byteLength', () => {
    it('should have a value of 6', () => {
      // Arrange
      const testMessage = new GLoginMsg()

      // Assert
      testMessage.byteLength.should.equal(6)
    })
  })
  describe('#get', () => {
    it('shoudl return a ByteField object when passed a valid field name', () => {
      // Arrange
      const testMessage = new GLoginMsg()
      /** @type {import('mcos-shared/structures/BinaryStructure').ByteField} */
      const expectedField = { name: 'msgNo', size: 2, offset: 0, type: 'u16', value: Buffer.alloc(2), order: 'little' }

      // Assert
      testMessage.get('msgNo').should.deep.equal(expectedField)
    })
  })
})
