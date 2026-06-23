import { CrcPreRaceDataMessage } from "./CrcPreRaceDataMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_crcPreRaceData");

/**
 * Handle MC_CRC_PRE_RACE_DATA (msgNo 434 / 0x01B2).
 *
 * Pre-race anti-cheat handshake. After the client loads the track and cars
 * but before sim start, it sends CRCs over local game assets and per-racer
 * car/parts data. The legacy server compares the reported CRCs against
 * authoritative server-side values, sets `bHasSentPreRaceCRC` for the
 * sender's racer slot, and OR-s mismatch flags into a `suspiciousEventFlags`
 * bitmask used later for cheater scoring.
 *
 * Stub: deserializes the header (msgNo, checkSum, raceID, trackCRC,
 * sliceInfoCRC, pacejkaCRC) and logs the structured fields. The per-racer
 * CRC region is kept as an opaque blob (decoding TODO — see
 * CrcPreRaceDataMessage docs). Returns no responses, matching the legacy
 * handler which sends nothing on the success path.
 *
 * Original implementation: MCity/Server/MCRaces.cpp:1275
 *   (MCRaces_CRCPreRaceData).
 *
 * TODO(crc-prerace): acquire the race lock by raceID via the race map; bail
 *   if not held (MCRaces.cpp:1290).
 * TODO(crc-prerace): locate the sender in raceInfo->racers[]; WARN+return
 *   if the player is not in the race (MCRaces.cpp:1313).
 * TODO(crc-prerace): mark `racers[thisRacer].bHasSentPreRaceCRC = true` and
 *   clear `bLetSlide` (MCRaces.cpp:1320).
 * TODO(crc-prerace): compare trackCRC against the authoritative track CRC;
 *   on mismatch OR `MC_CRC_kTrackFRD` into suspiciousEventFlags
 *   (MCRaces.cpp:1324).
 * TODO(crc-prerace): compare sliceInfoCRC against the authoritative value;
 *   on mismatch OR `MC_CRC_kTrackSliceBIN` (MCRaces.cpp:1333).
 * TODO(crc-prerace): compare pacejkaCRC against gPaceJkaCRC; on mismatch OR
 *   `MC_CRC_kPaceJKA` (MCRaces.cpp:1341).
 * TODO(crc-prerace): decode the per-racer CRC region (TypePreRacePlayerCRC[4]
 *   in MCDefs.h:2382) and copy each slot into
 *   `racers[thisRacer].savedCarCrcs[j]` for later cross-racer comparison
 *   (MCRaces.cpp:1355+).
 * TODO(crc-prerace): per-part validation against the parts table
 *   (MCRaces.cpp continues past line 1389, not yet read in detail).
 * TODO(crc-prerace): when all racers have reported, finalize the race-start
 *   gate and any cheat-flag bookkeeping.
 */
export async function _crcPreRaceData({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new CrcPreRaceDataMessage();
    msg.deserialize(packet.data);

    log.info(
        "MC_CRC_PRE_RACE_DATA received (stub — no validation/persistence)",
        {
            connectionId,
            raceId: msg.raceId,
            checkSum: msg.checkSum,
            trackCRC: msg.trackCRC,
            sliceInfoCRC: msg.sliceInfoCRC,
            pacejkaCRC: msg.pacejkaCRC,
            playersBlobBytes: msg.playersBlob.byteLength,
        },
    );

    // No client response on success — the legacy handler emits nothing on
    // the happy path and only logs warnings for CRC mismatches.
    return { connectionId, messages: [] };
}
