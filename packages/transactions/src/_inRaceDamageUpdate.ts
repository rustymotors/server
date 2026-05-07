import { DamagedPartsMessage } from "./DamagedPartsMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_inRaceDamageUpdate");

/**
 * Handle MC_IN_RACE_DAMAGE_UPDATE (msgNo 240 / 0x00F0).
 *
 * Periodic in-race telemetry from the client: reports current damage levels
 * for up to 47 parts on the local racer's car. The legacy server upserts each
 * (partID, damagePercent) into the parts table via stored procedure and
 * invalidates the affected vehicle's car-info cache once the loop is done.
 *
 * Stub: deserializes the payload, logs the structured summary, and returns
 * no responses. Same fire-and-forget contract as the legacy handler — this
 * message has no client reply.
 *
 * Original implementation: MCity/Server/MCParts.cpp:545 (InRaceDamageUpdate).
 *
 * TODO(damage): validate raceID via the race map; bail with WARN if
 *   invalidated (MCParts.cpp:557, MCRaces_IsRaceValid).
 * TODO(damage): for each (partID, damagePercent) entry, upsert via the
 *   equivalent of stored proc MC__MC_UPDPARTDAMAGE.
 * TODO(damage): on SP success, capture out_TopmostPartID and call the
 *   equivalent of PurgeCarCache(topMostPartID) once after the loop
 *   (MCParts.cpp:606).
 * TODO(damage): WARN on bad part id (dbs_result==1) or bad percent
 *   (dbs_result==2) — but do not send an error response (this message is
 *   fire-and-forget).
 */
export async function _inRaceDamageUpdate({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new DamagedPartsMessage();
    msg.deserialize(packet.data);

    log.info(
        "MC_IN_RACE_DAMAGE_UPDATE received (stub — no DB write/cache purge)",
        {
            connectionId,
            raceId: msg.raceId,
            noParts: msg.noParts,
            firstFew: msg.getValidParts().slice(0, 5),
        },
    );

    // No client response — the legacy handler returns false (no reply).
    return { connectionId, messages: [] };
}
