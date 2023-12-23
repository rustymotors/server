import { ServerError } from "../../../shared/errors/ServerError.js";
import { SerializedBuffer } from "../../../shared/messageFactory.js";

export class LobbyModel extends SerializedBuffer {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deserialize(_inputBuffer: Buffer): LobbyModel {
        throw new ServerError("Method not implemented.");
    }
    override serialize(): Buffer {
        throw new ServerError("Method not implemented.");
    }
    serializeSize(): number {
        throw new ServerError("Method not implemented.");
    }
    static schema = `CREATE TABLE IF NOT EXISTS "lobbies"
    (
      "lobyID" integer NOT NULL,
      "raceTypeID" integer NOT NULL,
      "turfID" integer NOT NULL,
      "riffName" character(32) NOT NULL,
      "eTerfName" character(265) NOT NULL,
      "clientArt" character(11) NOT NULL,
      "elementID" integer NOT NULL,
      "terfLength" integer NOT NULL,
      "startSlice" integer NOT NULL,
      "endSlice" integer NOT NULL,
      "dragStageLeft" integer NOT NULL,
      "dragStageRight" integer NOT NULL,
      "dragStagingSlice" integer NOT NULL,
      "gridSpreadFactor" real NOT NULL,
      "linear" smallint NOT NULL,
      "numPlayersMin" smallint NOT NULL,
      "numPlayersMax" smallint NOT NULL,
      "numPlayersDefault" smallint NOT NULL,
      "bnumPlayersEnable" smallint NOT NULL,
      "numLapsMin" smallint NOT NULL,
      "numLapsMax" smallint NOT NULL,
      "numLapsDefault" smallint NOT NULL,
      "bnumLapsEnabled" smallint NOT NULL,
      "numRoundsMin" smallint NOT NULL,
      "numRoundsMax" smallint NOT NULL,
      "numRoundsDefault" smallint NOT NULL,
      "bnumRoundsEnabled" smallint NOT NULL,
      "bWeatherDefault" smallint NOT NULL,
      "bWeatherEnabled" smallint NOT NULL,
      "bNightDefault" smallint NOT NULL,
      "bNightEnabled" smallint NOT NULL,
      "bBackwardDefault" smallint NOT NULL,
      "bBackwardEnabled" smallint NOT NULL,
      "bTrafficDefault" smallint NOT NULL,
      "bTrafficEnabled" smallint NOT NULL,
      "bDamageDefault" smallint NOT NULL,
      "bDamageEnabled" smallint NOT NULL,
      "bAIDefault" smallint NOT NULL,
      "bAIEnabled" smallint NOT NULL,
      "topDog" character(13) NOT NULL,
      "terfOwner" character(33) NOT NULL,
      "qualifingTime" integer NOT NULL,
      "clubNumPlayers" integer NOT NULL,
      "clubNumLaps" integer NOT NULL,
      "clubNumRounds" integer NOT NULL,
      "bClubNight" smallint NOT NULL,
      "bClubWeather" smallint NOT NULL,
      "bClubBackwards" smallint NOT NULL,
      "topSeedsMP" integer NOT NULL,
      "lobbyDifficulty" integer NOT NULL,
      "ttPointForQualify" integer NOT NULL,
      "ttCashForQualify" integer NOT NULL,
      "ttPointBonusFasterIncs" integer NOT NULL,
      "ttCashBonusFasterIncs" integer NOT NULL,
      "ttTimeIncrements" integer NOT NULL,
      "victoryPoints1" integer NOT NULL,
      "victoryCash1" integer NOT NULL,
      "victoryPoints2" integer NOT NULL,
      "victoryCash2" integer NOT NULL,
      "victoryPoints3" integer NOT NULL,
      "victoryCash3" integer NOT NULL,
      "minLevel" smallint NOT NULL,
      "minResetSlice" integer NOT NULL,
      "maxResetSlice" integer NOT NULL,
      "bnewbieFlag" smallint NOT NULL,
      "bdriverHelmetFlag" smallint NOT NULL,
      "clubNumPlayersMax" smallint NOT NULL,
      "clubNumPlayersMin" smallint NOT NULL,
      "clubNumPlayersDefault" smallint NOT NULL,
      "numClubsMax" smallint NOT NULL,
      "numClubsMin" smallint NOT NULL,
      "racePointsFactor" real NOT NULL,
      "bodyClassMax" smallint NOT NULL,
      "powerClassMax" smallint NOT NULL,
      "clubLogoID" integer NOT NULL,
      "teamtWeather" smallint NOT NULL,
      "teamtNight" smallint NOT NULL,
      "teamtBackwards" smallint NOT NULL,
      "teamtNumLaps" smallint NOT NULL,
      "raceCashFactor" real NOT NULL
    );`;
}
