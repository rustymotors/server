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

import { ServerLogger, LegacyMessage } from 'rusty-motors-shared';
import { GamePacket } from 'rusty-motors-protocol';
import { BytableMessage, BytableBuffer } from '@rustymotors/binary';

// Login handlers
import { login } from './login/login.js';

// Persona handlers
import { _selectGamePersona } from './persona/_selectGamePersona.js';
import { _gameLogout } from './persona/_gameLogout.js';
import { getPersonaInfo } from './persona/handlers/getPersonaInfo.js';
import { validatePersonaName } from './persona/handlers/validatePersonaName.js';
import { _getFirstBuddy } from './persona/_getFirstBuddy.js';
import { getPersonaMaps } from './persona/getPersonaMaps.js';

/**
 * An array of message handlers for processing different types of messages.
 * Each handler is associated with an operation code (opCode) and a name.
 *
 * @type {Array<{opCode: number, name: string, handler: function}>}
 *
 * @property {number} opCode - The operation code that identifies the type of message.
 * @property {string} name - The name of the message handler.
 * @property {function} handler - The function that processes the message. It takes an object with the following properties:
 * @property {string} handler.args.connectionId - The ID of the connection.
 * @property {BytableMessage | LegacyMessage | GamePacket} handler.args.message - The message to be processed.
 * @property {ServerLogger} handler.args.log - The logger for server logging.
 * @returns {Promise<{connectionId: string, messages: GamePacket[] | BytableBuffer[]}>} - A promise that resolves to an object containing the connection ID and an array of messages.
 */
export const messageHandlers: {
	opCode: number;
	name: string;
	handler: (args: {
		connectionId: string;
		message: BytableMessage | LegacyMessage | GamePacket;
		log?: ServerLogger;
	}) => Promise<{
		connectionId: string;
		messages: GamePacket[] | BytableBuffer[];
	}>;
}[] = [
	// Login handlers (port 8226)
	{
		opCode: 1281, // 0x0501
		name: "UserLogin",
		handler: login,
	},
	// Persona handlers (port 8228)
	{
		opCode: 1283, // 0x0503
		name: 'Game login',
		handler: _selectGamePersona,
	},
	{
		opCode: 1295, // 0x050F
		name: 'Game logout',
		handler: _gameLogout,
	},
	{
		opCode: 1305, // 0x0519
		name: 'Get persona info',
		handler: getPersonaInfo,
	},
	{
		opCode: 1330, // 0x0532
		// FIXED: Was incorrectly mapped to getPersonaInfo in login module
		// 0x532 is "Get Persona Maps", not "Get Persona Info" (which is 0x519)
		name: 'Get persona maps',
		handler: getPersonaMaps,
	},
	{
		opCode: 1331, // 0x0533
		name: 'Validate persona name',
		handler: validatePersonaName,
	},
	{
		opCode: 1291, // 0x050B
		name: 'Get first buddy',
		handler: _getFirstBuddy,
	},
];
