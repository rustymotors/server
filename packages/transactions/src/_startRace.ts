import { MessageNode } from "rusty-motors-shared";
import {
    StartRaceMessage,
    StartRaceResultMessage,
} from "./StartRaceMessages.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_startRace");

/**
 * Handle MC_RACE_START (msgNo 232 / 0xE8).
 *
 * Stub: deserializes the inbound StartRaceMsg, echoes the racer ids back in a
 * StartRaceResultMsg with okToStart=true, and skips all of the validation /
 * payment / escrow logic from the original server.
 *
 * Original implementation: MCity/Server/MCRaces.cpp:2880 (MCRaces_StartRace).
 *
 * TODO(start-race): acquire race lock by raceID; reply with okToStart=false +
 *      empty racers if the race doesn't exist (mirrors the !raceInfo.Lock()
 *      branch at MCRaces.cpp:2898).
 * TODO(start-race): populate the server-side race state from inMsg fields:
 *      noHumanPlayers, noAIPlayers, dialInTicks, racers[].vehicleID, and the
 *      human-vs-AI split. See MCRaces.cpp:2920-2953.
 * TODO(start-race): update the playerToRace mapping for each human racer
 *      (MCRaces.cpp:2940).
 * TODO(start-race): MCRaces_ResetRaceInfo equivalent — reset slice counters,
 *      lap counters, etc. (MCRaces.cpp:2956).
 * TODO(start-race): validate human count meets the required minimum
 *      (MCRaces_Query_HasRequiredNumberHumans, MCRaces.cpp:2958). Return
 *      okToStart=false if not.
 * TODO(start-race): time-trial lap-count cheat detection — reject when
 *      ttNumLaps != numberLaps. Emit NOC error severity MINOR/50202.
 *      (MCRaces.cpp:2962-2971).
 * TODO(start-race): club turfwar lap-count cheat detection — same shape, but
 *      for clubNumLaps; also set bRaceIsInvalid when MCRaces_gEnableCRCchecking
 *      is on (MCRaces.cpp:2974-2985).
 * TODO(start-race): charge entry fees per human racer; surface NSF failures
 *      via the racer entry's resultFlags. (MCRaces.cpp:2987-3013,
 *      MCRaces_PayEntryFees.)
 * TODO(start-race): pink-slip escrow when prizeAward == kMCopponentVehicle.
 *      Two human players' vehicles → escrow; flag inventory-cap violations
 *      via MC_RACERESULTS_INVENTORYCAPPED. (MCRaces.cpp:3016-3052.)
 * TODO(start-race): random-part-prize race — fetch current PAP info via
 *      MCRaces_FetchCurrentPAPInfo (MCRaces.cpp:3055-3059).
 * TODO(start-race): compute pre-race scrap value baseline per human racer for
 *      insurance damage tracking (MCRaces.cpp:3087-3092).
 * TODO(start-race): write race-event log entries for "Start Race Request",
 *      "Starting Race" per racer (MCRaces.cpp:2896, 3086, MCRaces_LogRaceEvent).
 * TODO(start-race): broadcast — in the original, the StartRaceResultMsg goes
 *      to *the host*, and other participants get notified via a separate path.
 *      Today this stub only replies to the requesting connection. Revisit when
 *      multi-participant routing exists.
 * TODO(start-race): exception path — wrap the real logic in a try/catch like
 *      the original (MCRaces.cpp:2867, 3097) so a single bad input doesn't
 *      poison the queue.
 */
export async function _startRace({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const startRaceMessage = new StartRaceMessage();
    startRaceMessage.deserialize(packet.data);

    log.debug(`StartRaceMsg: ${startRaceMessage.toString()}`);

    const reply = new StartRaceResultMessage();
    reply.raceId = startRaceMessage.raceId;
    reply.okToStart = true; // TODO(start-race): replace with real validation

    // Echo back the racer ids; isntValid stays false in the stub.
    startRaceMessage.racers.forEach((racer, idx) => {
        if (racer.id !== 0) {
            reply.setRacer(idx, racer.id, false);
        }
    });

    log.debug(`StartRaceResultMsg: ${reply.toString()}`);

    const rPacket = new MessageNode();
    rPacket.sequence = packet.sequenceNumber;
    rPacket.setPayloadEncryption(true);
    rPacket.setBody(reply);

    log.debug(`_startRace: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}
