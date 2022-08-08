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

export class Byte {
  private _byte = new Uint8Array(1)
  private _maxSize = 255

  private constructor(x: number) {
    this.checkSize(x)
  }

  private checkSize(x: number) {
    if (x < 0 || x > this._maxSize) {
      throw new RangeError(`value must be between 0 and ${this._maxSize}`)
    }
  }

  static from(x: number): Byte {
    const byte = new Byte(x)
    byte._byte[0] = x
    return byte
  }

  asNumber(): number {
    return Number(this._byte)
  }
}

export class Word  {
  private _word: Buffer = Buffer.from([0x00, 0x00])
  private _maxSize = 65535

  private constructor(x: number) {
    this.checkSize(x)
  }

  private checkSize(x: number) {
    if (x < 0 || x > this._maxSize) {
      throw new RangeError(`value must be between 0 and ${this._maxSize}`)
    }
  }

  static from(x: number): Word {
    const word = new Word(x)
    console.log(x)
    word._word[0] = x & 0xFF
    word._word[1] = x >>> 8 & 0xFF
    console.log(`0: ${word._word[0]}`)
    console.log(`1: ${word._word[1]}`)
    return word
  }

  asNumber(): number {
    const n = ((this._word[1] as number) << 8) + (this._word[0] as number)
    return n
  }
}

export class DWord {
  private _dword: Buffer = Buffer.from([0x00, 0x00, 0x00, 0x00])
  private _maxSize = 4294967295

  private constructor(x: number) {
    this.checkSize(x)

  }

  private checkSize(x: number) {
    if (x < 0 || x > this._maxSize) {
      throw new RangeError(`value must be between 0 and ${this._maxSize}`)
    }
  }

  static from(x: number): DWord {
    const dword = new DWord(x)
    console.log(x)
    dword._dword[0] = x & 0xFFFF
    dword._dword[1] = x >>> 8 & 0xFFFF
    dword._dword[2] = x >>> 16 & 0xFFFF
    dword._dword[3] = x >>> 24 & 0xFFFF
    console.log(`0: ${dword._dword[0]}`)
    console.log(`1: ${dword._dword[1]}`)
    console.log(`2: ${dword._dword[2]}`)
    console.log(`3: ${dword._dword[3]}`)
    return dword
  }

  asNumber(): number {
    const n = ((this._dword[3] as number) << 24) + ((this._dword[2] as number) << 16) + ((this._dword[1] as number) << 8) + (this._dword[0] as number)
    return n
  }
}

// export class SerializeBase {
//   private serializedBufferPtr_: Buffer = Buffer.alloc(0)

// }

const b = Word.from(9230)
console.log(b.asNumber())

const d = DWord.from(142893037)
console.log(d.asNumber())
