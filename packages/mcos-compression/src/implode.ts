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

import assert from "assert";
import { CMP_NO_ERROR, TCmpStruct } from "./types.js";


//-----------------------------------------------------------------------------
// Main imploding function

export function implode(readBuf: Buffer, writeBuf: Buffer, workBuf: TCmpStruct, para: Buffer, type: Buffer, dSize: number): number {
  const pWork = workBuf

  let nChCode = 0
  let nCount = 0
  let i = 0
  let nCount2 = 0

  // Fill the work buffer information
  // Note: The caller must zero the "work_buf" before passing it to implode
  Object.entries(workBuf).forEach(key => {
    const val = key[1] as Buffer
    console.log(`${key[0]}, ${val}`)
    assert(val.compare(Buffer.alloc(val.byteLength)) === 0, `${key[0]} is not empty!`)
  })

  return CMP_NO_ERROR
}
