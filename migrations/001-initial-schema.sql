-- Up
CREATE TABLE
IF NOT EXISTS "sessions"
(
   customer_id integer,
   session_key text  NOT NULL,
   s_key text  NOT NULL,
   context_id text  NOT NULL,
   connection_id text  NOT NULL,
   CONSTRAINT pk_session PRIMARY KEY
(customer_id)
);

CREATE TABLE
IF NOT EXISTS "lobbies"
(
			lobbyID integer, 
      raceTypeID integer, 
      turfID integer, 
      riffName character
(32), 
      eTurfName character
(256), 
      clientArt character
(11), 
      elementID integer, 
			turfLength integer, 
      startSlice integer, 
      endSlice integer, 
      dragStageLeft real, 
      dragStageRight real, 
      dragStagingSlice integer, 
			gridSpreadFactor real, 
      linear smallint, 
      numPlayersMin smallint, 
      numPlayersMax smallint, 
      numPlayersDefault smallint, 
			bnumPlayersEnabled smallint, 
      numLapsMin smallint, 
      numLapsMax smallint, 
      numLapsDefault smallint, 
      bNumLapsEnabled smallint, 
      numRoundsMin smallint, 
      numRoundsMax smallint, 
			numRoundsDefault smallint, 
      bNumRoundsEnabled smallint, 
      bWeatherDefault smallint, 
      bWeatherEnabled smallint, 
      bNightDefault smallint, 
			bNightEnabled smallint, 
      bBackwardDefault smallint, 
      bBackwardEnabled smallint, 
      bTrafficDefault smallint, 
      bTrafficEnabled smallint, 
			bDamageDefault smallint, 
      bDamageEnabled smallint, 
      bAIDefault smallint, 
      bAIEnabled smallint, 
      topDog character
(13), 
      turfOwner character
(33), 
      qualifyingTime integer, 
			clubNumPlayers integer, 
      clubNumLaps integer, 
      clubNumRounds integer, 
      bClubNight smallint, 
      bClubWeather smallint, 
      bClubBackwards smallint, 
      topSeedsMPS integer, 
			lobbyDifficulty integer, 
      ttPointForQualify integer, 
      ttCashForQualify integer, 
      ttPointBonusFasterIncs integer, 
      ttCashBonusFasterIncs integer, 
			ttTimeIncrements integer, 
      victoryPoints1 integer, 
      victoryCash1 integer, 
      victoryPoints2 integer, 
      victoryCash2 integer, 
      victoryPoints3 integer,
			victoryCash3 integer, 
      minLevel smallint, 
      minResetSlice integer, 
      maxResetSlice integer, 
      bnewbieFlag smallint, 
      bdriverHelmetFlag smallint,
			clubNumPlayersMax smallint, 
      clubNumPlayersMin smallint, 
      clubNumPlayersDefault smallint, 
      numClubsMax smallint, 
      numClubsMin smallint,
			racePointsFactor real, 
      bodyClassMax smallint, 
      powerClassMax smallint, 
      clubLogoID integer, 
      teamtWeather smallint, 
      teamtNight smallint,
			teamtBackwards smallint, 
      teamtNumLaps smallint, 
      teamtBaseTUP integer, 
      raceCashFactor real

);


-- Down
DROP TABLE "sessions";

DROP TABLE "lobbies";