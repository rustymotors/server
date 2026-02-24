import { NPS_MESSAGE_IDS } from "./NPSMessageIds.js";
import { AUTH_MESSAGE_IDS } from "./AuthMessageIds.js";
import { MCOTS_MESSAGE_IDS } from "./MCOTSMessageIds.js";

const idToName = new Map<number, string>();

for (const [name, id] of Object.entries(NPS_MESSAGE_IDS)) {
	idToName.set(id, name);
}
for (const [name, id] of Object.entries(AUTH_MESSAGE_IDS)) {
	idToName.set(id, name);
}
for (const [name, id] of Object.entries(MCOTS_MESSAGE_IDS)) {
	idToName.set(id, name);
}

/**
 * Resolve a numeric message ID to a human-readable string.
 *
 * @example
 * resolveMessageId(0x0217) // "0x0217/TRACKING_PING"
 * resolveMessageId(0x0501) // "0x0501/USER_LOGIN"
 * resolveMessageId(0x9999) // "0x9999/unknown"
 */
export function resolveMessageId(id: number): string {
	const hex = `0x${id.toString(16).padStart(4, "0")}`;
	const name = idToName.get(id) ?? "unknown";
	return `${hex}/${name}`;
}
