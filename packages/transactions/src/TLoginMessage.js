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

import { MessageNode } from "../../shared/MessageNode.js";

export class TLoginMessage extends MessageNode {
    /**
     * Creates an instance of TLoginMessage.
     * @param {import("../../shared/log.js").Logger} log
     */
    constructor(log) {
        super();
        log.debug("new TLoginMessage");
        this._msgNo = 0; // 2 bytes
        this._customerId = 0; // 4 bytes
        this._personaId = 0; // 4 bytes
        this._lotOwnerId = 0; // 4 bytes
        this._brandedPartId = 0; // 4 bytes
        this._skinId = 0; // 4 bytes
        this._personaName = ""; // 13 bytes
        this._mcVersion = ""; // 4 bytes
    }

    /**
     * @override
     */
    get size() {
        return 40;
    }

    /**
     * @override
     * @param {Buffer} buffer
     */
    deserialize(buffer) {
        let offset = 0;
        this.header.length = buffer.readUInt16BE(offset);
        if (this.header.length !== this.size) {
            throw new Error(
                `Invalid packet size: ${this.header.length} (expected ${this.size})`,
            );
        }
        offset += 2;
        this.header.mcoSig = buffer.toString("utf8", offset, offset + 4);
        offset += 4;
        this._msgNo = buffer.readUInt16BE(offset);
        offset += 2;
        this._customerId = buffer.readUInt32BE(offset);
        offset += 4;
        this._personaId = buffer.readUInt32BE(offset);
        offset += 4;
        this._lotOwnerId = buffer.readUInt32BE(offset);
        offset += 4;
        this._brandedPartId = buffer.readUInt32BE(offset);
        offset += 4;
        this._skinId = buffer.readUInt32BE(offset);
        offset += 4;
        this._personaName = buffer.toString("utf8", offset, offset + 13);
        offset += 13;
        this._mcVersion = buffer.toString("utf8", offset, offset + 4);
        offset += 4; // 40 bytes
    }

    /**
     * @override
     */
    serialize() {
        const buffer = Buffer.alloc(this.size);
        let offset = 0;
        buffer.writeUInt16BE(this.size, offset);
        offset += 2;
        buffer.write(this.header.mcoSig, offset, 4, "utf8");
        offset += 4;
        buffer.writeUInt16BE(this._msgNo, offset);
        offset += 2;
        buffer.writeUInt32BE(this._customerId, offset);
        offset += 4;
        buffer.writeUInt32BE(this._personaId, offset);
        offset += 4;
        buffer.writeUInt32BE(this._lotOwnerId, offset);
        offset += 4;
        buffer.writeUInt32BE(this._brandedPartId, offset);
        offset += 4;
        buffer.writeUInt32BE(this._skinId, offset);
        offset += 4;
        buffer.write(this._personaName, offset, 13, "utf8");
        offset += 13;
        buffer.write(this._mcVersion, offset, 4, "utf8");
        offset += 4;
        return buffer;
    }

    /**
     * @override
     */
    toString() {
        return `TLoginMessage(msgNo=${this._msgNo}, customerId=${this._customerId}, personaId=${this._personaId}, lotOwnerId=${this._lotOwnerId}, brandedPartId=${this._brandedPartId}, skinId=${this._skinId}, personaName=${this._personaName}, mcVersion=${this._mcVersion})`;
    }
}
