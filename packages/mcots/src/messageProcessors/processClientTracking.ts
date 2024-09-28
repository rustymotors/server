import { ClientTrackingMessage } from "rusty-motors-mcots";
import { getServerLogger } from "rusty-motors-shared";
import type { ServerPacket } from "rusty-motors-shared-packets";
import type { ServerSocketCallback } from "./index.js";

const log = getServerLogger({
	name: "processClientTracking",
});

export async function processClientTracking(
	_connectionId: string,
	message: ServerPacket,
	socketCallback: ServerSocketCallback,
) {

	log.debug(`Processing client tracking message`);

	const trackingMessage = new ClientTrackingMessage(0).deserialize(
		message.serialize(),
	);

	log.debug(
		`Type: ${trackingMessage.getType()}, Tracking Text: ${trackingMessage.getTrackingText()}`,
	);

	// Do something with the tracking data

	void socketCallback([]);

	return Promise.resolve();
}
