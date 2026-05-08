import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_destroyPart");

/**
 * Handle MC_DESTROY_PART (msgNo 214 / 0x00D6).
 *
 * "Scrap for cash" — the player destroys a part and receives its junkPrice
 * credited to their bank balance. The part *and its subtree* are removed
 * from inventory or from a vehicle.
 *
 * Wire shape: GenericRequest (10 bytes) — `data` carries the partId.
 *
 * Stub: parse partId, log, return no response (matches both Recons and the
 * legacy comment "Does not return a result to the client (who cares?)").
 * No state change, no cash credit.
 *
 * Original implementation: MCity/Server/MCParts.cpp:691 (DestroyPart).
 *
 * TODO(parts-mgmt): locate the part — first in the player's inventory,
 *   then in any vehicle owned by the persona. Bail if not found.
 * TODO(parts-mgmt): remove the part *and all child parts* (subtree). For
 *   a chassis, the suspension and brakes go with it. Recons does this
 *   via removePartSubtree (mco-revival.mjs:1733) → destroyLocalPart
 *   (mco-revival.mjs:3001).
 * TODO(parts-mgmt-economy): sum each removed part's `junkPrice` and
 *   credit the player's bank balance by the total. Recons does this
 *   in-memory via creditBank against a single global balance — needs to
 *   become a per-persona DB transaction.
 * TODO(parts-mgmt): persist the deletion via the stored proc equivalent
 *   and invalidate the affected vehicle's car-info cache.
 * TODO(parts-mgmt): refuse to destroy the vehicle's root chassis the
 *   same way RemovePart does — destroying the root would orphan the
 *   vehicle.
 */
export async function _destroyPart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const partId =
        packet.data.byteLength >= 6 ? packet.data.readUInt32LE(2) : 0;

    log.info(
        "MC_DESTROY_PART received (stub — no inventory remove/cash credit)",
        {
            connectionId,
            partId,
        },
    );

    // Legacy + Recons both no-op the response; the client doesn't expect a
    // reply for this opcode.
    return { connectionId, messages: [] };
}
