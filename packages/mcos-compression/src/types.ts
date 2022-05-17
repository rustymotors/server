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

export const CMP_NO_ERROR = 0

export interface TCmpStruct {
  /** 0000 */
  offs0000: Buffer              // 0000
  /** 0004: Compression type (CMP_BINARY or CMP_ASCII) */
  ctype: Buffer                 // 0004: Compression type (CMP_BINARY or CMP_ASCII)
  /** 0005: Polition in output buffer */
  outputPos: Buffer             // 0005: Polition in output buffer
  /** 000C: Dict size (4, 5, 6 for 0x400, 0x800, 0x1000) */
  dsizeBits: Buffer            // 000C: Dict size (4, 5, 6 for 0x400, 0x800, 0x1000)
  /** 0010: Dict size bitmask (0x0F, 0x1F, 0x3F for 0xx400, 0x800, 0x1000) */
  dSizeMask: Buffer            // 0010: Dict size bitmask (0x0F, 0x1F, 0x3F for 0xx400, 0x800, 0x1000)
  /** 0014: 16-bit buffer for processing input data */
  bitBuff: Buffer              // 0014: 16-bit buffer for processing input data
  /** 0018: Number of extra (above 8) bits in bit buffer */
  extraBits: Buffer            // 0018: Number of extra (above 8) bits in bit buffer
  /** 001C: Position in in_buff */
  inPos: Buffer                // 001C: Position in in_buff
  /** 0020: Number of bytes in input buffer */
  inBytes: Buffer              // 0020: Number of bytes in input buffer
  /** 0034: Custom parameter */
  param: unknown                // 0034: Custom parameter

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
  DistPosCodes: Buffer          // 2A34: [0x100] Table of distance position codes
  /** 2B34: [0x100] Table of length codes */
  LengthCodes: Buffer           // 2B34: [0x100] Table of length codes
  /** 2C34: [0x100] Table for ??? */
  offs2C34: Buffer              // 2C34: [0x100] Table for ???
  /** 2D34: [0x100] Table for ??? */
  offs3D34: Buffer              // 2D34: [0x100] Table for ???
  /** 2E34: [0x80] Table for ??? */
  offs2E34: Buffer              // 2E34: [0x80] Table for ???
  /** 2EB4: [0x100] Table for ??? */
  offs2EB4: Buffer              // 2EB4: [0x100] Table for ???
  /** 2FB4: [0x100] Table for ??? */
  ChBitsAsc: Buffer             // 2FB4: [0x100] Table for ???
  /** 30B4: [0x40] Numbers of bytes to skip for copied block length */
  DistBits: Buffer              // 30B4: [0x40] Numbers of bytes to skip for copied block length
  /** 30F4: [0x10] Numbers of bits to skip for copied block length */
  LenBits: Buffer               // 30F4: [0x10] Numbers of bits to skip for copied block length
  /** 3104: [0x10] Number of valid bits for copied blocks */
  ExLenBits: Buffer             // 3104: [0x10] Number of valid bits for copied blocks
  /** 3114: [0x10] Buffer for ??? */
  LenBase: Buffer               // 3114: [0x10] Buffer for ???
}
