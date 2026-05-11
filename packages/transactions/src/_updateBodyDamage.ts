import { BodyDamageMessage } from "./BodyDamageMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_updateBodyDamage");

/**
 * Handle MC_UPDATE_BODY_DAMAGE (msgNo 202 / 0x00CA).
 *
 * Reports the persistent body-damage blob for a vehicle. Sent both in-game
 * (raceID = 0, e.g. arcade or non-race contexts) and at end-of-race
 * (raceID != 0, only counted if the race wasn't invalidated for cheating).
 *
 * Stub: deserializes the message, logs the structured fields, and returns
 * no responses. Same fire-and-forget contract as the legacy handler on the
 * success path.
 *
 * Original implementation: MCity/Server/MCCar.cpp:999 (UpdateBodyDamage).
 *
 * TODO(body-damage): if raceID != 0, validate via MCRaces_IsRaceValid;
 *   bail with WARN ("UpdateBodyDamage() invalidated") if the race had
 *   cheating, so damage is not credited (MCCar.cpp:1010).
 * TODO(body-damage): clamp damageLength to DAMAGE_SIZE; WARN if it
 *   exceeded ("Invalid Damage Length") (MCCar.cpp:1025).
 * TODO(body-damage): persist via the equivalent of stored proc
 *   MC__MC_UPDVEHICLEDAMAGEINFO(vehicleID, damage). Pass NULL for an
 *   empty blob.
 * TODO(body-damage): MCERROR on SP failure; WARN on dbs_result.v.vul == 1
 *   (invalid vehicle id) and similar specific error codes
 *   (MCCar.cpp:1049).
 */
export async function _updateBodyDamage({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new BodyDamageMessage();
    msg.deserialize(packet.data);

    log.info("MC_UPDATE_BODY_DAMAGE received (stub — no DB persist)", {
        connectionId,
        vehicleId: msg.vehicleId,
        raceId: msg.raceId,
        damageLength: msg.damageLength,
        damageBytes: msg.damage.byteLength,
    });

    return { connectionId, messages: [] };
}
