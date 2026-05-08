import { CrcPostRaceDataMessage } from "./CrcPostRaceDataMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_crcPostRaceData");

/**
 * Handle MC_CRC_POST_RACE_DATA (msgNo 435 / 0x01B3).
 *
 * Post-race anti-cheat handshake. After the sim ends, the client reports
 * each racer's vehicle and model CRCs so the server can compare them
 * against the values captured pre-race (MC_CRC_PRE_RACE_DATA, opcode 434).
 * Any mismatch indicates a cheater swapped vehicles or parts mid-race.
 *
 * Stub: deserializes the fixed 58-byte struct (msgNo, checkSum, raceID, and
 * playerCRC[4]) and logs the structured fields. No comparison, no flagging,
 * no response. Returns nothing — the legacy handler emits no client reply
 * on the success path either.
 *
 * Original implementation: MCity/Server/MCRaces.cpp:1631
 *   (MCRaces_CRCPostRaceData).
 *
 * TODO(crc-postrace): acquire the race lock by raceID via the race map;
 *   bail if not held (MCRaces.cpp:1646).
 * TODO(crc-postrace): locate the sender in raceInfo->racers[]; NOC-error
 *   and return if the player is not in the race (MCRaces.cpp:1665, severity
 *   MINOR, code 50202).
 * TODO(crc-postrace): mark `racers[thisRacer].bHasSentPostRaceCRC = true`
 *   (MCRaces.cpp:1675).
 * TODO(crc-postrace): if `bLetSlide` is set on this racer (the pre-race CRC
 *   excused them), short-circuit with a WARN — no further validation
 *   (MCRaces.cpp:1677).
 * TODO(crc-postrace): for each playerCRC[j] in the message, find the
 *   matching playerID in `racers[thisRacer].savedCarCrcs[]` (saved by
 *   MCRaces_CRCPreRaceData) and compare the vehicle CRC. On any miss:
 *   - target playerID not found in saved table:
 *       suspiciousEventFlags |= MC_CRC_kPrePostCarMismatch
 *   - vehicle CRC mismatch on the sender's own car:
 *       suspiciousEventFlags |= MC_CRC_kPrePostCarMismatch
 *   - vehicle CRC mismatch on an opponent:
 *       suspiciousEventFlags |= MC_CRC_kPrePostCarOpponent
 * TODO(crc-postrace): persist suspiciousEventFlags for cheater scoring (the
 *   legacy code accumulates these across pre-race and post-race checks).
 */
export async function _crcPostRaceData({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new CrcPostRaceDataMessage();
    msg.deserialize(packet.data);

    log.info(
        "MC_CRC_POST_RACE_DATA received (stub — no comparison/persistence)",
        {
            connectionId,
            raceId: msg.raceId,
            checkSum: msg.checkSum,
            playerCrcs: msg.getPlayerCrcs(),
        },
    );

    // No client response on success.
    return { connectionId, messages: [] };
}
