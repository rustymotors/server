import { RacerLeftRaceMessage } from "./RacerLeftRaceMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_racerLeftRace");

/**
 * Handle MC_RACER_LEFT_RACE (msgNo 235 / 0x00EB).
 *
 * Sent when the racer quits the race (typically by hitting the "Replay"
 * option) before crossing the finish line. The legacy server logs the
 * abandonment, locks the race map by raceID, and calls
 * MCRaces_RacerQuitRace to update racer state and notify other racers.
 *
 * Stub: deserializes the GenericRequest payload, logs the structured
 * fields, and returns no response (matching the legacy contract).
 *
 * Original implementation: MCity/Server/MCRaces.cpp:5236
 *   (MCRaces_RacerLeftRace).
 *
 * TODO(racer-left): MCRaces_LogRaceEvent(raceID, racerId, "Left race
 *   (aborted)") — record in the race history (MCRaces.cpp:5245).
 * TODO(racer-left): acquire the race map lock by raceID; WARN+return if
 *   the raceID is invalid (MCRaces.cpp:5247, "Racer Left Race Invalid
 *   RaceID").
 * TODO(racer-left): call MCRaces_RacerQuitRace(raceInfo, info, node) to
 *   update racer state and notify the rest of the field (MCRaces.cpp:5251).
 */
export async function _racerLeftRace({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new RacerLeftRaceMessage();
    msg.deserialize(packet.data);

    log.info("MC_RACER_LEFT_RACE received (stub — no race-state update)", {
        connectionId,
        raceId: msg.raceId,
    });

    return { connectionId, messages: [] };
}
