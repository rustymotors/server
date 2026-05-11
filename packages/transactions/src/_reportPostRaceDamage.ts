import { DamageAndWearMessage } from "./DamageAndWearMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_reportPostRaceDamage");

/**
 * Handle MC_REPORT_POST_RACE_DAMAGE (msgNo 241 / 0x00F1).
 *
 * Sent at end of race to commit each part's final damage *and* wear values
 * for persistence. Unlike the in-race damage tick (opcode 240) which only
 * carries damagePercent, this message also carries cumulative wear; both
 * are packed into a single DWORD per part.
 *
 * Stub: deserializes the message, logs the structured summary, and returns
 * no responses. The legacy handler can produce a client error response
 * (RequestFailed with MC_DB_ERROR) on stored-proc failure — that path is
 * deferred by TODO.
 *
 * Original implementation: MCity/Server/MCParts.cpp:613
 *   (ReportPostRaceDamage).
 *
 * TODO(post-race-damage): validate raceID via MCRaces_IsRaceValid; bail
 *   with WARN if invalidated (MCParts.cpp:626).
 * TODO(post-race-damage): for each entry, upsert via the equivalent of
 *   stored proc MC__MC_UPDPARTDAMAGEANDWEAR(partID, damagePercent, wear).
 * TODO(post-race-damage): on SP error, NOCERROR + RequestFailed(node,
 *   MC_DB_ERROR, dbs_result.v.vul) — this is the one place in the damage
 *   family where the server *does* reply on failure (MCParts.cpp:650+).
 * TODO(post-race-damage): WARN with specific reason for dbs_result codes
 *   1 (invalid part id), 2 (invalid damage), 3 (invalid wear), 4 (update
 *   error) (MCParts.cpp:660-674).
 * TODO(post-race-damage): after the loop, PurgeCarCache(out_TopmostPartID)
 *   to invalidate the affected vehicle cache (MCParts.cpp:681).
 * TODO(post-race-damage): MCRaces_UpdateInsuranceRisk(info, raceID,
 *   playerId) so the insurance subsystem can adjust the player's risk
 *   score based on final damage (MCParts.cpp:684).
 */
export async function _reportPostRaceDamage({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new DamageAndWearMessage();
    msg.deserialize(packet.data);

    log.info(
        "MC_REPORT_POST_RACE_DAMAGE received (stub — no DB persist / insurance update)",
        {
            connectionId,
            raceId: msg.raceId,
            noParts: msg.noParts,
            firstFew: msg.getEntries().slice(0, 5),
        },
    );

    return { connectionId, messages: [] };
}
