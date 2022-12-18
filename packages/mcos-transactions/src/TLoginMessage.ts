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

import { logger } from "../../mcos-logger/src/index.js";
import { TSMessageBase } from "./TMessageBase.js";

const log = logger.child({ service: "mcos:shared:types" });

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */

export class TLoginMessage extends TSMessageBase {
    appId = 0;

    /**
     * Creates an instance of TLoginMessage.
     * @memberof TLoginMessage
     */
    constructor() {
        super();
        log.trace("new TLoginMessage");
        this._add({
            name: "msgNo",
            order: "little",
            size: 2,
            type: "u16",
            value: Buffer.alloc(2),
        });
        this._add({
            name: "customerId",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        this._add({
            name: "personaId",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        this._add({
            name: "lotOwnerId",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        this._add({
            name: "brandedPartId",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        this._add({
            name: "skinId",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        this._add({
            name: "personaName",
            order: "little",
            size: 13,
            type: "char",
            value: Buffer.alloc(13),
        });
        this._add({
            name: "mcVersion",
            order: "little",
            size: 4,
            type: "u32",
            value: Buffer.alloc(4),
        });
        // 49 bytes + 11 in super = 50 bytes
    }

    /**
     *
     * @return {number}
     */
    getAppId(): number {
        return this.appId;
    }

    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string {
        return `TLoginMessage',
        ${JSON.stringify(this._fields)}`;
    }
}
