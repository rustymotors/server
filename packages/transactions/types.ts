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

import {
    OldServerMessage,
    ServerMessage,
    ServerMessageType,
    TServerLogger,
} from "@rustymotors/shared";

export interface MessageHandlerArgs {
    connectionId: string;
    packet: ServerMessageType;
    log: TServerLogger;
}

export interface MessageHandlerResult {
    connectionId: string;
    messages: OldServerMessage[] | ServerMessage[];
}

export interface MessageHandler {
    name: string;
    direction: "in" | "out" | "both";
    handler: (args: MessageHandlerArgs) => Promise<MessageHandlerResult>;
}
