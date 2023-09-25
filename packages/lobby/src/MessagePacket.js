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

import { ServerError } from "../../shared/errors/ServerError.js";

export class MessagePacket {
    /**
     *
     * @param {Buffer} buffer
     * @returns {MessagePacket}
     * @memberof MessagePacket
     */
    static fromBuffer(buffer) {
        const newMessage = new MessagePacket();
        newMessage.setBuffer(buffer);
        return newMessage;
    }

    /**
     * Will replace internal buffer without warning
     * @param {Buffer} buffer
     */
    setBuffer(buffer) {
        this._buffer = buffer;
    }

    /**
     *
     * @returns {Buffer}
     */
    getBuffer() {
        if (typeof this._buffer === "undefined") {
            throw new ServerError("Buffer not set");
        }
        return this._buffer;
    }
}
