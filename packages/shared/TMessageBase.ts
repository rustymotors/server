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

import { Logger } from "pino";
import { BinaryStructureBase } from "./BinaryStructure.js";

/**
 * @class
 * @extends {BinaryStructureBase}
 */
export class TransactionMessageBase extends BinaryStructureBase {
    /**
     * What byte order are the fields?
     * @type {'big' | 'little'}
     */
    _byteOrder = "big";

    /**
     * Creates an instance of TSMessageBase.
     * @author Drazi Crendraven
     * @param {Logger} log
     * @memberof TSMessageBase
     */
    constructor(log: Logger) {
        super(log);
        log.debug("new TSMessageBase");
        this._add({
            name: "dataLength",
            order: "little",
            type: "u16",
            size: 2,
            value: Buffer.alloc(2),
        });

        this._add({
            name: "mcoSig",
            order: "little",
            type: "char",
            size: 4,
            value: Buffer.from([84, 79, 77, 67]), // TOMC
        });

        this._add({
            name: "seq",
            order: "little",
            type: "u16",
            size: 4,
            value: Buffer.alloc(4),
        });

        this._add({
            name: "flags",
            order: "little",
            type: "byte",
            size: 1,
            value: Buffer.from([8]),
        });
    }
    // 11 bytes total in this class
}
