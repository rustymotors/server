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
import { getServerLogger, NPSMessage } from "rusty-motors-shared";
import { handleLoginData } from "./internal.js";

/**
 * Receives login data and handles the login process.
 * 
 * @param {Object} options - The options for receiving login data.
 * @param {string} options.connectionId - The connection ID.
 * @param {NPSMessage} options.message - The login message.
 * @param {import("pino").Logger} [options.log] - The logger instance.
 * 
 * @returns {Promise<import("../../shared/State.js").ServiceResponse>} The response from the login process.
 * 
 * @throws {Error} If there was an error in the login service.
 */
export async function receiveLoginData({
    connectionId,
    message,
    log = getServerLogger({
        module: "LoginServer",
    }),
}: {
    connectionId: string;
    message: NPSMessage;
    log?: import("pino").Logger;
}): Promise<import("../../shared/State.js").ServiceResponse> {
    try {
        log.debug("Entering login module");
        const response = await handleLoginData({
            connectionId,
            message,
            log,
        });
        log.debug(`There are ${response.messages.length} messages`);
        log.debug("Exiting login module");
        return response;
    } catch (error) {
        const err = new Error(
            `There was an error in the login service: ${String(error)}`,
        );
        throw err;
    }
}
