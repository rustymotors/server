import { CompletedRaceMessage } from "./CompletedRaceMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_racerCompletedRace");

/**
 * Handle MC_RACER_COMPLETED_RACE (msgNo 234 / 0xEA).
 *
 * Sent by the client when the local racer crosses the finish line. Carries
 * the racer's reported result (time, top speed, best lap, security flags,
 * travel map) for server-authoritative validation, persistence, and prize
 * awarding.
 *
 * Stub: deserializes the payload, logs the structured fields, and returns
 * no responses. Single-player races still complete in-game; the result just
 * isn't persisted yet.
 *
 * Original implementation: MCity/Server/MCRaces.cpp:4913
 *   (MCRaces_RacerCompletedRace).
 *
 * TODO(race-results): acquire the race lock by raceID; reject with
 *   MC_DB_ERROR if invalid (MCRaces.cpp:4928).
 * TODO(race-results): verify the finished racer is in the race
 *   (MC_PERSONA_NOT_IN_RACE, MCRaces.cpp:4957).
 * TODO(race-results): anti-cheat — for human racers, the reported `id` must
 *   match the sender's persona id; otherwise reject with
 *   MC_DB_ERROR/MC_POSSIBLE_CHEAT (MCRaces.cpp:4964).
 * TODO(race-results): validate racing state == MCRaces_RACINGSTATE_RACING;
 *   reject with MC_FAILED otherwise (MCRaces.cpp:4976).
 * TODO(race-results): inspect securityFlags — non-zero indicates the client
 *   detected potential cheats locally and we should record/penalize.
 * TODO(race-results): persist to the race history table — completionTime,
 *   bestLapTime, topSpeed, avgSpeed, travelMap, securityFlags.
 * TODO(race-results): award cash, race points, level/rank deltas, and any
 *   part-prize the race had configured.
 * TODO(race-results): when ALL human racers have reported, finalize the
 *   race (close it out, broadcast results to all racers).
 * TODO(race-results): generate the appropriate response message — likely a
 *   FinalResultsMsg (MCDefs.h:1479) or RacerPlacement update — when the
 *   race is fully resolved.
 */
export async function _racerCompletedRace({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const completedRace = new CompletedRaceMessage();
    completedRace.deserialize(packet.data);

    log.info("MC_RACER_COMPLETED_RACE received (stub — no validation/persistence)", {
        connectionId,
        raceId: completedRace.raceId,
        racerId: completedRace.id,
        topSpeed: completedRace.topSpeed,
        avgSpeed: completedRace.avgSpeed,
        completionTime: completedRace.completionTime,
        bestLapTime: completedRace.bestLapTime,
        securityFlags: completedRace.securityFlags,
        travelMapLength: completedRace.travelMapLength,
    });

    if (completedRace.securityFlags !== 0) {
        log.warn(
            "MC_RACER_COMPLETED_RACE reports non-zero securityFlags (client-detected potential cheat)",
            {
                connectionId,
                raceId: completedRace.raceId,
                racerId: completedRace.id,
                securityFlags: completedRace.securityFlags,
            },
        );
    }

    // Empty response for now.
    // TODO(race-results): emit FinalResultsMsg once the race is fully
    //   resolved (all human racers reported).
    return { connectionId, messages: [] };
}
