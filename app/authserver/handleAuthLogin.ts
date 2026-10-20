// detroit is a game server, written from scratch, for an old game
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

import { IncomingMessage, ServerResponse } from "node:http";
import { authDB } from "./db.ts";
import { randomUUID } from "node:crypto";

class AuthLoginResponse {
	valid: boolean = false;
	ticket: string = "";
	reasonCode: string = "";
	reasonText: string = "";
	reasonUrl: string = "";

	static createValid(ticket: string) {
		return `Valid=TRUE\nTicket=${ticket}`;
	}

	static createInvalid(
		reasonCode: string,
		reasonText: string,
		reasonUrl: string,
	) {
		return `reasoncode=${reasonCode}\nreasontext=${reasonText}\nreasonurl=${reasonUrl}`;
	}

	formatResponse() {
		if (this.valid) {
			return `Valid=TRUE\nTicket=${this.ticket}`;
		} else {
			return `reasoncode=${this.reasonCode}\nreasontext=${this.reasonText}\nreasonurl=${this.reasonUrl}`;
		}
	}
}




/**
* Generates a ticket for the given customer ID.
*
* @param customerId - The ID of the customer for whom the ticket is being generated.
* @returns The ticket associated with the given customer ID, or an empty string if no ticket is found.
*/
function generateTicket(customerId: string): string {
	console.log(`Generating ticket for customerId: ${customerId}`);
	const ticket = randomUUID();
	console.log(`Generated ticket: ${ticket}`);
	return ticket;
}


/**
 * Retrieves a user account based on the provided username and password.
 *
 * @param username - The username of the account to retrieve.
 * @param password - The password of the account to retrieve.
 * @returns An object containing the username, ticket, and customerId if the account is found, or null if not.
 */
function retrieveUserAccount(
	username: string,
	password: string,
): { username: string; ticket: string; customerId: string } | null {
	const customer = authDB.findUser(username, password);
	if (customer == null) {
		console.log(`No user found for username: ${username}`);
		return null;
	}
	console.log(`User found: ${username} with customerId: ${customer.customerId}`);
	return {
		username,
		ticket: generateTicket(customer.customerId.toString()),
		customerId: customer.customerId.toString(),
	};

}

export function handleAuthLogin(request: IncomingMessage, response: ServerResponse) {
	this.log.info("Handling AuthLogin request");
	// Implement authentication logic here
	const url = new URL(
		`http://${process.env["HOST"] ?? "localhost"}${request.url}`,
	);
	const username = url.searchParams.get("username") ?? "";
	const password = url.searchParams.get("password") ?? "";


	response.setHeader("Content-Type", "text/plain");
	let authResponse = "Invalid Request";
	const user = retrieveUserAccount(username, password);

	if (user !== null) {
		const ticket = generateTicket(user.customerId);
		if (ticket !== "") {
			authResponse = AuthLoginResponse.createValid(ticket);
		}
	} else {

		authResponse = AuthLoginResponse.createInvalid(
			"INV-100",
			"Opps!",
			"https://winehq.com",
		);
	}
	response.end(authResponse);
}
