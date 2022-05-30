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

/** Binary compression */
export const CMP_BINARY = 0     // Binary compression
/** Ascii compression */
export const CMP_ASCII = 1      // Ascii compression

// Return codes
export const CMP_NO_ERROR = 0
export const CMP_INVALID_DICTSIZE = 1
export const CMP_INVALID_MODE = 2

export const CMP_IMPLODE_DICT_SIZE1 = 1024
export const CMP_IMPLODE_DICT_SIZE2 = 2048
export const CMP_IMPLODE_DICT_SIZE3 = 4096

export interface TCmpStruct {
  /** 0000: Backward distance of the currently found repetition, decreased by 1 */
  distance: number              // 0000: Backward distance of the currently found repetition, decreased by 1
  /** 0004: # bytes available in out_buff */
  outBytes: number              // 0004: # bytes available in out_buff
  /** 0008: # of bits available in the last out byte */
  outBits: number               // 0008: # of bits available in the last out byte
  /**
   * 000C: Number of bits needed for dictionary size.
   * + 4 = 0x400
   * + 5 = 0x800
   * + 6 = 0x1000
   */
  dSizeBits: 4 | 5 | 6             // 000C: Number of bits needed for dictionary size. 4 = 0x400, 5 = 0x800, 6 = 0x1000
  /**
   * 0010: Bit mask for dictionary.
   * + 0x0F = 0x400
   * + 0x1F = 0x800
   * + 0x3F = 0x1000
   */
  dSizeMask: number             // 0010: Bit mask for dictionary. 0x0F = 0x400, 0x1F = 0x800, 0x3F = 0x1000
  /**
   * 0014: Compression type
   * + 0 = CMP_BINARY)
   * + 1 = CMP_ASCII
   */
  cType: 0 | 1                  // 0014: Compression type (CMP_ASCII or CMP_BINARY)
  /** 0018: Dictionary size in bytes */
  dSizeBytes: number            // 0018: Dictionary size in bytes
  /** [0x40] 001C: Distance bits */
  distBits: number[]              // 001C: Distance bits
  /** [0x40] Distance codes */
  distCodes: number[]             // 005C: Distance codes
  /** [0x306] 009C: Table of literal bit lengths to be put to the output stream */
  nChBits: number[]               // 009C: Table of literal bit lengths to be put to the output stream
  /** [0x306] 009C: Table of literal bit lengths to be put to the output stream */
  nChCodes: number[]              // 03A2: Table of literal codes to be put to the output stream
  /** 09AE: */
  offs08AE: Buffer              // 09AE:

  /** 09B0: User parameter */
  param: {}                // 09B0: User parameter
  /** 9B4 */
  readBuf: ReadBuff      // 9B4
  /** 9B8 */
  writeBuf: WriteBuff     // 9B8

  /** [0x204] 09BC: */
  offs09BC: Buffer              // 09BC:
  /** 0DC4: */
  offs0DC4: Buffer              // 0DC4:
  /** [0x900] 0DC8: Array of indexes (one for each PAIR_HASH) to the "pair_hash_offsets" table */
  pHashToIndex: number[]          // 0DC8: Array of indexes (one for each PAIR_HASH) to the "pair_hash_offsets" table
  /** 1FC8: End marker for "phash_to_index" table */
  pHashToIndexEnd: Buffer       // 1FC8: End marker for "phash_to_index" table
  /** [0x802] 1FCA: Compressed data */
  outBuff: Buffer               // 1FCA: Compressed data
  /**
   * [0x2204] 27CC: Work buffer
   *
   *   \+ DICT_OFFSET  => Dictionary
   *
   *   \+ UNCMP_OFFSET => Uncompressed data
   */
  workBuff: Buffer              // 27CC: Work buffer
                                //  + DICT_OFFSET  => Dictionary
                                //  + UNCMP_OFFSET => Uncompressed data
  /** [0x2204] 49D0: Table of offsets for each PAIR_HASH */
  pHashOffs: number[]             // 49D0: Table of offsets for each PAIR_HASH
}

// Decompression structure
export interface TDCmpStruct {
  /** 0000 */
  offs0000: Buffer              // 0000
  /** 0004: Compression type (CMP_BINARY or CMP_ASCII) */
  ctype: Buffer                 // 0004: Compression type (CMP_BINARY or CMP_ASCII)
  /** 0005: Polition in output buffer */
  outputPos: Buffer             // 0005: Polition in output buffer
  /**
   * 000C: Dict size
   * + 4 = 0x400
   * + 5 = 0x800
   * + 6 = 0x1000
   */
  dsizeBits: 4 | 5 | 6            // 000C: Dict size (4, 5, 6 for 0x400, 0x800, 0x1000)
  /**
   * 0010:  Dict size bitmask.
   * + 0x0F = 0x400
   * + 0x1F = 0x800
   * + 0x3F = 0x1000
   */
  dSizeMask: number            // 0010: Dict size bitmask (0x0F, 0x1F, 0x3F for 0xx400, 0x800, 0x1000)
  /** 0014: 16-bit buffer for processing input data */
  bitBuff: Buffer              // 0014: 16-bit buffer for processing input data
  /** 0018: Number of extra (above 8) bits in bit buffer */
  extraBits: Buffer            // 0018: Number of extra (above 8) bits in bit buffer
  /** 001C: Position in in_buff */
  inPos: Buffer                // 001C: Position in in_buff
  /** 0020: Number of bytes in input buffer */
  inBytes: Buffer              // 0020: Number of bytes in input buffer
  /** 0034: Custom parameter */
  param: {}                // 0034: Custom parameter

  // /** Pointer to function that reads data from the input stream */
  // readBuf: (inBuffer: Buffer, size: number) => void          // Pointer to function that reads data from the input stream
  // /** Pointer to function that writes data to the output stream */
  // writeBuf: (outBuffer: Buffer, size: number) => void        // Pointer to function that writes data to the output stream

  /**
   * 0030: [0x2204] Output cicle buffer
   *
   *    0x0000 - 0x0FFF: Previous uncompressed data, kept for repetitions
   *
   *    0x1000 - 0x1FFF: Currently decompressed data
   *
   *    0x2000 - 0x2203: Reserve space fot the largest possible repetition
   */

  /** 0030: [0x2204] Output cicle buffer */
  outBuff: Buffer              // 0030: [0x2204] Output cicle buffer
  /** 2234: Buffer for data to be decompressed */
  inBuff: Buffer               // 2234: [0x800] Buffer for data to be decompressed
  /** 2A34: Table of distance position codes */
  DistPosCodes: number[]          // 2A34: [0x100] Table of distance position codes
  /** 2B34: [0x100] Table of length codes */
  LengthCodes: number[]           // 2B34: [0x100] Table of length codes
  /** 2C34: [0x100] Table for ??? */
  offs2C34: Buffer              // 2C34: [0x100] Table for ???
  /** 2D34: [0x100] Table for ??? */
  offs3D34: Buffer              // 2D34: [0x100] Table for ???
  /** 2E34: [0x80] Table for ??? */
  offs2E34: Buffer              // 2E34: [0x80] Table for ???
  /** 2EB4: [0x100] Table for ??? */
  offs2EB4: Buffer              // 2EB4: [0x100] Table for ???
  /** 2FB4: [0x100] Table for ??? */
  ChBitsAsc: number[]             // 2FB4: [0x100] Table for ???
  /** 30B4: [0x40] Numbers of bytes to skip for copied block length */
  DistBits: Buffer              // 30B4: [0x40] Numbers of bytes to skip for copied block length
  /** 30F4: [0x10] Numbers of bits to skip for copied block length */
  LenBits: Buffer               // 30F4: [0x10] Numbers of bits to skip for copied block length
  /** 3104: [0x10] Number of valid bits for copied blocks */
  ExLenBits: Buffer             // 3104: [0x10] Number of valid bits for copied blocks
  /** 3114: [0x10] Buffer for ??? */
  LenBase: Buffer               // 3114: [0x10] Buffer for ???
  readBuf: ReadBuff
  writeBuf: WriteBuff
}

export class ReadBuff {
  private buffer: number[];
  constructor(inBuffer: Buffer) {
    this.buffer = Array.from(inBuffer)
  }

  public read(size: number, _param?: {}) {
    let bits: number[] = []
    for (let index = 0; index < size; index++) {
      const b = this.buffer.shift()
      if (typeof b !== 'undefined') {
        bits.push(b)
      }

    }
    return bits
  }
}

export class WriteBuff {
  private buffer: number[] = [];

  public write(data: number[]): void {
    this.buffer.concat(data)
  }

  public asBuffer(): Buffer {
    return Buffer.from(this.buffer)
  }
}

