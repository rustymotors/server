const rc4 = require('arc4')
const util = require('./nps_utils.js')
const logger = require('./logger.js')

const db = require('../lib/database/index.js')

// Connection::Connection()
// {
// 	id				= 0;
// 	appID			= 0;
// 	status			= INACTIVE;
// 	sock			= 0;
// 	port			= 0;
// 	q				= COMMMGR_DEFAULT_Q;
// 	msgEvent		= NULL;
// 	lastMsg			= 0;
// 	sendBacklog		= 0;	// the # of pending sends for this connection
// 	lastBacklogNotify = 0;	// when did we notify about backlog
// 	incommingThread	= NULL;
// 	hbCount			= 0;
// 	sbCount			= 0;			// how many times did we notify about backlog
// 	useEncryption	= 0;
// 	enc				= NULL;
// #ifdef MCSERVER
// 	netInterface	= UnknownInterface;
// #endif
// }

// function CompressedHeader(msg) {
//     if (!(this instanceof CompressedHeader)) {
//         return new CompressedHeader(msg)
//     }
//     //LENSIZE	uncompressedLength;
//     this.uncompressedLength = msg.readInt16LE()
//     //BYTE	data[1];	// starting spot for the compressed data
//     this.data = msg.readInt8(2)
// }

// struct Connection
function Connection() {
  if (!(this instanceof Connection)) {
    return new Connection();
  }

  // id				= 0;
  this.id = 0;

  // 	appID			= 0;
  this.appID = 0;

  // 	status			= INACTIVE;
  this.status = "INACTIVE";

  // 	sock			= 0;
  this.sock = 0;

  // 	msgEvent		= NULL;
  this.msgEvent = null;

  // 	lastMsg			= 0;
  this.lastMsg = 0;

  // 	useEncryption	= 0;
  this.useEncryption = 0;
  // 	enc				= NULL;
  this.enc = null;
}

function MSG_STRING(msgID) {
    switch (msgID) {
    case 438:
        return 'MC_CLIENT_CONNECT_MSG'
    default:
      return "Unknown";
  }
}

function fetchSessionKeyByRemoteAddress(remoteAddress, callback) {
    db.query(
        'SELECT session_key FROM sessions WHERE remote_address = $1',
        [remoteAddress],
        (err, res) => {
            if (err) {
                // Unknown error
                console.error(
                    `DATABASE ERROR: Unable to retrieve sessionKey: ${err.message}`
                )
                callback(err)
            } else {
                callback(null, res)
            }
        }
    )
}

// struct LoginCompleteMsg
// {
// 	WORD	msgNo; // MC_LOGIN_COMPLETE = 213 = 0xd5
// 	DWORD	serverTime;
// 	char	firstTime:1;
// 	char	paycheckWaiting:1;
// 	char	clubInviatationsWaiting:1;
// 	char	tallyInProgress:1;
// 	WORD	secondsTillShutdown;
//
// 	double	shardGNP;
// 	DWORD	shardCarsSold;
// 	DWORD	shardAveSalary;
// 	DWORD	shardAveCarsOwned;
// 	DWORD	shardAvePlayerLevel;
//
// 	MCOTSListEntry ServerList[MAX_NUM_MCOTS_SERVERLIST_SLOTS];
//
// 	DWORD	webCookie;	// used by GPS web page to provide some minimal validation of the user;
// 						//  o created by MCOTS; stored into DB at login time
// 						//  o submitted by client in web page posts
// 						//  o java compares this value against PLAYER.WEBCOOKIE
// 	SQL_TIMESTAMP_STRUCT	nextTallyDate;
// 	SQL_TIMESTAMP_STRUCT	nextPaycheckDate;
// };
function ClientConnect(con, node) {

    logger.debug('In ClientConnect...')

    fetchSessionKeyByRemoteAddress(con.sock.remoteAddress, (err, res) => {
        if (err) {
            throw err
        }
        
        // Create the encryption object
        con.enc = rc4('arc4', res.rows[0].session_key)
        
        
        util.dumpResponse(node.rawBuffer, node.rawBuffer.length)
        
        // write the socket
        con.sock.write(node.rawBuffer)
        
        // return MC_SUCCESS = 101;
        return 101
    })
}

// returning true means fatal error; thread should exit
// bool ProcessInput( MessageNode* node, ConnectionInfo * info)
function ProcessInput(node, info) {
<<<<<<< HEAD
    let preDecryptMsgNo = Buffer.from([0xFF, 0xFF])
=======
  const preDecryptMsgNo = Buffer.from([0xff, 0xff, 0xff, 0xff]);

  logger.debug(info);
>>>>>>> master

  // NOTE: All messages handled here should have the BaseMsgHeader
  // at the beginning of the msg (???????)  If the message is from a Lobby Server,
  // or the Login Sever, the from needs to identify that by using the "special" id 0
  const msg = node.getBaseMsgHeader(node.buffer);

  const currentMsgNo = msg.msgNo;

<<<<<<< HEAD
    // MC_FAILED = 102
    let result = 102
    
    // MASSIVE case goes here!

    switch (MSG_STRING(currentMsgNo)) {
    case 'MC_CLIENT_CONNECT_MSG':
        logger.info((node, info, ''))
        result = ClientConnect(info, node) // in MCLogin.cpp
    
        break
=======
  // MASSIVE case goes here!

  switch (currentMsgNo) {
    //   case MC_CLIENT_CONNECT_MSG:
    //     logger.info((node, info, ""));
    //     result = ClientConnect(info, node); // in MCLogin.cpp
    //
    //     break;
>>>>>>> master
    //
    //   case MC_LOGIN:
    //     logger.info((node, info, ""));
    //     result = LoginUser(info, node);
    //
    //     // Recompute High Water Mark
    //     TestHighWaterMark();
    //
    //     break;
    //
    //   case MC_PROCESS_DISCONNECT: // unexpected disconnect
    //     logger.info((node, info, ""));
    //     result = ProcessDisconnect(info, node);
    //
    //     break;
    //
    //   case MC_LOGOUT:
    //     logger.info((node, info, ""));
    //     result = LogoutRequested(info, node);
    //
    //     break;
    //
    //   case MC_OFFER_ENTRY:
    //     logger.info((node, info, ""));
    //     result = PlaceOffer(info, node);
    //
    //     break;
    //
    //   case MC_BID_ENTRY:
    //     logger.info((node, info, ""));
    //     result = PlaceBid(info, node);
    //
    //     break;
    //
    //   case MC_GET_PLAYER_INFO:
    //     logger.info((node, info, ""));
    //     GetPlayerInfo(info, node);
    //
    //     break;
    //
    //   case MC_SET_OPTIONS:
    //     logger.info((node, info, ""));
    //     SetOptions(info, node);
    //
    //     break;
    //
    //   case MC_RACER_UPDATE:
    //     logger.info(
    //       (node, info, "******** Invalid Message - Racer Update **********")
    //     );
    //
    //     break;
    //
    //   case MC_STOCK_CAR_INFO:
    //     logger.info((node, info, ""));
    //     GetStockCars(info, node);
    //
    //     break;
    //
    //   case MC_PURCHASE_STOCK_CAR:
    //     logger.info((node, info, ""));
    //     PurchaseStockCar(info, node);
    //
    //     break;
    //
    //   case MC_RR_GET_RAW_LIST:
    //     logger.info((node, info, ""));
    //     GetRighteousRidesRawList(info, node);
    //
    //     break;
    //
    //   case MC_RR_GET_ALREADY_PURCHASED_LIST:
    //     logger.info((node, info, ""));
    //     GetRighteousRidesAlreadyPurchasedList(info, node);
    //
    //     break;
    //
    //   case MC_RR_PURCHASE_CAR:
    //     logger.info((node, info, ""));
    //     PurchaseRighteousRidesCar(info, node);
    //
    //     break;
    //
    //   case MC_GET_COMPLETE_VEHICLE_INFO:
    //     logger.info((node, info, ""));
    //     GetAllCarInfo(info, node);
    //
    //     break;
    //
    //   case MC_PLAYER_NAMES:
    //     logger.info((node, info, ""));
    //     GetIDList(info, node);
    //
    //     break;
    //
    //   case MC_SCRAP_CAR:
    //     logger.info((node, info, ""));
    //     ScrapCar(info, node);
    //
    //     break;
    //
    //   case MC_GET_SCRAP_VALUE:
    //     logger.info((node, info, ""));
    //     GetScrapValue(info, node);
    //
    //     break;
    //
    //   case MC_GET_PLAYERS_VEHICLES:
    //     logger.info((node, info, ""));
    //     GetPlayersVehicles(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_CACHED_VEHICLE:
    //     logger.info((node, info, ""));
    //     UpdateCachedVehicle(info, node);
    //
    //     break;
    //
    //   case MC_VERIFY_OWNERSHIP:
    //     logger.info((node, info, ""));
    //     VerifyOwnership(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_SKIN:
    //     logger.info((node, info, ""));
    //     UpdateSkin(info, node);
    //
    //     break;
    //
    //   case MC_GET_OWNED_VEHICLES:
    //     logger.info((node, info, ""));
    //     GetOwnedVehicles(info, node);
    //
    //     break;
    //
    //   case MC_BUY_NEW_PART:
    //     logger.info((node, info, ""));
    //     BuyNewPart(info, node);
    //
    //     break;
    //
    //   case MC_REPAIR_SINGLE_PART:
    //     logger.info((node, info, ""));
    //     RepairSinglePart(info, node);
    //
    //     break;
    //
    //   case MC_REPAIR_MULTIPLE_PARTS:
    //     logger.info((node, info, ""));
    //     RepairMultipleParts(info, node);
    //
    //     break;
    //
    //   case MC_INSTALL_PART:
    //     logger.info((node, info, ""));
    //     InstallPart(info, node);
    //
    //     break;
    //
    //   case MC_REMOVE_PART:
    //     logger.info((node, info, ""));
    //     RemovePart(info, node);
    //
    //     break;
    //
    //   case MC_GET_ASSEMBLY_PARTS:
    //     logger.info((node, info, ""));
    //     GetAssemblyParts(info, node);
    //
    //     break;
    //
    //   case MC_GET_OWNED_PARTS:
    //     logger.info((node, info, ""));
    //     GetOwnedParts(info, node);
    //
    //     break;
    //
    //   case MC_GET_TRADEIN_VALUE:
    //     logger.info((node, info, ""));
    //     GetTradeinValue(info, node);
    //
    //     break;
    //
    //   /*
    // case MC_GET_USED_CAR_PRICE:
    //   logger.info(( node, info, ""));
    //   GetResaleValue(info, node);
    //
    // break;
    // */
    //
    //   case MC_KEEP_RACE_ALIVE:
    //     logger.info((node, info, ""));
    //     MCRaces_KeepRaceAlive(info, node);
    //
    //     break;
    //
    //   case MC_CREATE_STANDARD_RACE:
    //     logger.info((node, info, ""));
    //     MCRaces_CreateStandardRace(info, node);
    //
    //     break;
    //
    //   case MC_RACE_JOIN:
    //     logger.info((node, info, ""));
    //     result = MCRaces_JoinRace(info, node);
    //
    //     break;
    //
    //   case MC_RACE_START:
    //     logger.info((node, info, ""));
    //     MCRaces_StartRace(info, node);
    //
    //     break;
    //
    //   case MC_RACER_COMPLETED_RACE:
    //     logger.info((node, info, ""));
    //     MCRaces_RacerCompletedRace(info, node);
    //
    //     break;
    //
    //   case MC_RACER_LEFT_RACE:
    //     logger.info((node, info, ""));
    //     MCRaces_RacerLeftRace(info, node);
    //
    //     break;
    //
    //   case MC_RACER_DNF_RACE:
    //     logger.info((node, info, ""));
    //     MCRaces_RacerDidNotFinishRace(info, node);
    //
    //     break;
    //
    //   case MC_RACER_FAULTED:
    //     logger.info((node, info, ""));
    //     MCRaces_RacerFaulted(info, node);
    //     break;
    //
    //   case MC_IN_RACE_DAMAGE_UPDATE:
    //     logger.info((node, info, ""));
    //     InRaceDamageUpdate(info, node);
    //
    //     break;
    //
    //   case MC_REMOVE_ALL_CACHED_VEHICLES:
    //     logger.info((node, info, ""));
    //     RemoveAllCachedVehicles(info, node);
    //
    //     break;
    //
    //   case MC_DISPLAY_OWNED_CACHED_VEHICLES:
    //     logger.info((node, info, ""));
    //     DisplayOwnedCachedVehicles(info, node);
    //
    //     break;
    //
    //   case MC_DISPLAY_ALL_CACHED_VEHICLES:
    //     logger.info((node, info, ""));
    //     DisplayAllCachedVehicles(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_BODY_DAMAGE:
    //     logger.info((node, info, ""));
    //     UpdateBodyDamage(info, node);
    //
    //     break;
    //
    //   case MC_REPORT_POST_RACE_DAMAGE:
    //     logger.info((node, info, ""));
    //     ReportPostRaceDamage(info, node);
    //
    //     break;
    //
    //   case MC_GET_TRACK_GAME_RECORDS:
    //     logger.info((node, info, ""));
    //     GetTrackGameRecords(info, node);
    //
    //     break;
    //
    //   case MC_GET_VEHICLE_GAME_RECORDS:
    //     logger.info((node, info, ""));
    //     GetVehicleGameRecords(info, node);
    //
    //     break;
    //
    //   case MC_DELETE_VEHICLE_GAME_RECORDS:
    //     logger.info((node, info, ""));
    //     DeleteVehicleGameRecords(info, node);
    //
    //     break;
    //
    //   case MC_CHECK_FOR_SCHEDULED_EVENTS:
    //     logger.info((node, info, ""));
    //     if (DebugMarqueeMessages) server.MarqueeMessage(0, 0, msgEvent);
    //     // Commented out: CheckForScheduledEvents(info, node);
    //
    //     break;
    //
    //   case MC_OPEN_EVENT:
    //     logger.info((node, info, ""));
    //     //OpenEvent(info, node);
    //
    //     break;
    //
    //   case MC_CLOSE_EVENT:
    //     logger.info((node, info, ""));
    //     //CloseEvent(info, node);
    //
    //     break;
    //
    //   case MC_REGISTER_FOR_EVENT:
    //     logger.info((node, info, ""));
    //     //RegisterForEvent(info, node);
    //
    //     break;
    //
    //   case MC_JOIN_EVENT_RACE:
    //     logger.info((node, info, ""));
    //     //JoinEvent(info, node);
    //
    //     break;
    //
    //   case MC_DESTROY_PART:
    //     logger.info((node, info, ""));
    //     DestroyPart(info, node);
    //
    //     break;
    //
    //   case MC_GET_EVENT_INVITATIONS:
    //     logger.info((node, info, ""));
    //     //GetEventInvitations(info, node);
    //
    //     break;
    //
    //   case MC_GET_BODY_DAMAGE_INFO:
    //     logger.info((node, info, ""));
    //     GetBodyDamageInfo(info, node);
    //
    //     break;
    //
    //   case MC_GET_EVENTS_LIST:
    //     logger.info((node, info, ""));
    //     //GetFullEventsList(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_PLAYER_PHYSICAL:
    //     logger.info((node, info, ""));
    //     UpdatePlayerPhysical(info, node);
    //
    //     break;
    //
    //   case MC_GET_PLAYER_PHYSICAL:
    //     logger.info((node, info, ""));
    //     GetPlayerPhysical(info, node);
    //
    //     break;
    //
    //   case MC_CREATE_REPLACEMENT_DB_CONNECTION:
    //     logger.info((node, info, ""));
    //     CreateReplacmentDBConnection(); //info, node);
    //
    //     break;
    //
    //   case MC_GET_REGISTRATION_LIST:
    //     logger.info((node, info, ""));
    //     //GetRegistrationList(info, node);
    //
    //     break;
    //
    //   case MC_EVENTS_CENTER_ENTER:
    //     logger.info((node, info, ""));
    //     //EnterEventsCenter(info, node);
    //
    //     break;
    //
    //   case MC_EVENTS_CENTER_LEAVE:
    //     logger.info((node, info, ""));
    //     //LeaveEventsCenter(info, node);
    //
    //     break;
    //
    //   case MC_LEAVE_EVENT_WAITING_LIST:
    //     logger.info((node, info, ""));
    //     //LeaveEventWaitingList(info, node);
    //
    //     break;
    //
    //   case MC_BUY_NEW_ASSEMBLY:
    //     logger.info((node, info, ""));
    //     BuyNewAssembly(info, node);
    //
    //     break;
    //
    //   case MC_REMOVE_FROM_EVENTS:
    //     logger.info((node, info, ""));
    //     //RemoveFromEvents(info, node);
    //
    //     break;
    //
    //   case MC_GET_PLAYER_CURRENT_VEHICLE:
    //     logger.info((node, info, ""));
    //     GetCurrentVehicle(info, node);
    //
    //     break;
    //
    //   case MC_SET_PLAYER_CURRENT_VEHICLE:
    //     logger.info((node, info, ""));
    //     SetCurrentVehicle(info, node);
    //
    //     break;
    //
    //   case MC_SYSTEM_DISABLE_PENDING_SHUTDOWN:
    //     logger.info((node, info, ""));
    //     DisablePendingShutdown(info, node);
    //
    //     break;
    //
    //   case MC_SYSTEM_ENABLE_LOGINS:
    //     logger.info((node, info, ""));
    //     EnableLogins(info, node);
    //
    //     break;
    //
    //   case MC_SYSTEM_BROADCAST:
    //     //BroadcastMessage(info, node);
    //     logger.info((node, info, ""));
    //
    //     break;
    //
    //   case MC_UPDATE_EVENT_SUMMARY:
    //     logger.info((node, info, ""));
    //     //MCLOG("Update Event Summary");
    //     //UpdateEventSummary(info, node);
    //     MCLOG("Update Event Summary - Commented out for now");
    //
    //     break;
    //
    //   case MC_GET_SEVEN_DAY_EVENT_SUMMARY:
    //     logger.info((node, info, ""));
    //     //GetEventSummary(info, node);
    //
    //     break;
    //
    //   /*
    // // Obsolete. Not ported to OCI.
    // case MC_GET_PLAYER_SANCTIONED_RACE_HISTORY:
    //   logger.info(( node, info, ""));
    //   MCRaces_GetPlayerRaceHistory(info, node);
    //
    // break;
    // */
    //
    //   case MC_GET_ASSEMBLY_REPAIR_PRICE:
    //     logger.info((node, info, ""));
    //     GetAssemblyRepairPrice(info, node);
    //
    //     break;
    //
    //   //case MC_SETUP_PHYSICS_CHECK:
    //   //	logger.info(( node, info, ""));
    //   //	SetupPhysicsCheck(info, node);
    //   //
    //   //break;
    //
    //   case MC_SETUP_MCO_TUNABLES:
    //     logger.info((node, info, ""));
    //     SetupMCOTunables(info, node);
    //     MCRaces_GetPurseGlobals(info, node);
    //
    //     break;
    //
    //   case MC_CHECK_CAR_PHYSICS:
    //     logger.info((node, info, ""));
    //     CheckCarPhysics(info, node);
    //
    //     break;
    //
    //   /*
    // case MC_GET_CUSTOMER_PERSONA_INFO:
    //   logger.info(( node, info, ""));
    //   GetCustomerPersonaInfo(info, node);
    //
    // break;
    // */
    //
    //   //case MC_GET_PURSE_GLOBALS:
    //   //obsolete
    //   //break;
    //
    //   case MC_UPDATE_BADGE_POINTS:
    //     logger.info((node, info, ""));
    //     UpdateBadgePoints(info, node);
    //
    //     break;
    //
    //   case MC_GET_BADGES_EARNED:
    //     logger.info((node, info, ""));
    //     GetBadgesEarned(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_RACERS_STARTED:
    //     logger.info((node, info, ""));
    //     //	MCRaces_UpdateRacersStarted(info, node);
    //
    //     break;
    //
    //   case MC_UPDATE_RACERS_DONE:
    //     logger.info((node, info, ""));
    //     MCRaces_UpdateRacersCompleted(info, node);
    //
    //     break;
    //
    //   //case MC_RECORD_TIME_TRIAL_TIME:
    //   //	logger.info(( node, info, "ERROR: Record Time Trial Time - OBSOLETE"));
    //   //RecordTimeTrial(info, node);
    //   //break;
    //
    //   case MC_GET_TIME_TRIAL_TOP_TEN:
    //     logger.info((node, info, ""));
    //     MCRaces_GetTimeTrialRecords(info, node);
    //
    //     break;
    //
    //   case MC_DELETE_PERSONA:
    //     logger.info((node, info, ""));
    //     DeletePersona(info, node);
    //
    //     break;
    //
    //   case MC_GET_ARCADE_CARS:
    //     logger.info((node, info, ""));
    //     GetArcadeCars(info, node);
    //
    //     break;
    //
    //   case MC_GET_LOBBIES:
    //     logger.info((node, info, ""));
    //     GetLobbies(info, node);
    //
    //     break;
    //
    //   case MC_GET_MCOTS_VERSION:
    //     logger.info((node, info, ""));
    //     GetMCOTSVersion(info, node);
    //
    //     break;
    //
    //   case MC_REQUEST_RACE_RESTART:
    //     logger.info((node, info, ""));
    //     MCRaces_RequestRaceRestart(info, node);
    //
    //     break;
    //
    //   case MC_TW_HOST_SESSION:
    //     logger.info((node, info, ""));
    //     TWHostSession(info, node);
    //
    //     break;
    //
    //   case MC_TW_JOIN_SESSION:
    //     logger.info((node, info, ""));
    //     TWJoinSession(info, node);
    //
    //     break;
    //
    //   case MC_TW_REQUEST_CANCEL:
    //     logger.info((node, info, ""));
    //     TWRequestCancel(info, node);
    //
    //     break;
    //
    //   case MC_TW_REQUEST_STATUS_CHANGE:
    //     logger.info((node, info, ""));
    //     TWRequestStatusChange(info, node);
    //
    //     break;
    //
    //   case MC_TW_REQUEST_COMPLETION:
    //     logger.info((node, info, ""));
    //     TWRequestCompletion(info, node);
    //
    //     break;
    //
    //   case MC_TW_REQUEST_OFFER_CHANGE:
    //     logger.info((node, info, ""));
    //     TWRequestOfferChange(info, node);
    //
    //     break;
    //
    //   case MC_GET_PLAYER_RACING_HISTORY:
    //     logger.info((node, info, ""));
    //     GetPlayerRacingHistory(info, node);
    //
    //     break;
    //
    //   case MC_GET_GAME_URLS:
    //     logger.info((node, info, ""));
    //     GetGameURLs(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_CREATE_REQUEST:
    //     logger.info((node, info, ""));
    //     ClubCreateRequest(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_RESIGN_REQUEST:
    //     logger.info((node, info, ""));
    //     ClubResignRequest(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_INVITE_PLAYER:
    //     logger.info((node, info, ""));
    //     ClubInvitePlayer(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_UNINVITE_PLAYER:
    //     logger.info((node, info, ""));
    //     ClubUnInvitePlayer(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_QUIT_REQUEST:
    //     logger.info((node, info, ""));
    //     ClubQuitRequest(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_CHANGE_DESCRIPTION:
    //     logger.info((node, info, ""));
    //     ClubChangeDescription(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_PROMOTE_MEMBER:
    //     logger.info((node, info, ""));
    //     ClubPromoteMember(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_DEMOTE_OFFICER:
    //     logger.info((node, info, ""));
    //     ClubDemoteOfficer(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_EJECT_MEMBER:
    //     logger.info((node, info, ""));
    //     ClubEjectMember(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_INVITATION_REPLY:
    //     logger.info((node, info, ""));
    //     ClubInvitationReply(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_LIST_OF_CLUBS:
    //     logger.info((node, info, ""));
    //     ClubGetListOfClubs(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_CLUB_INFO:
    //     logger.info((node, info, ""));
    //     ClubGetClubInfo(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_CLUB_MEMBERS:
    //     logger.info((node, info, ""));
    //     ClubGetClubMembers(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_CLUB_OFFICERS:
    //     logger.info((node, info, ""));
    //     ClubGetClubOfficers(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_MEMBER_INFO:
    //     logger.info((node, info, ""));
    //     ClubGetMemberInfo(info, node);
    //
    //     break;
    //
    //   case MC_GET_MCO_TUNABLES:
    //     logger.info((node, info, ""));
    //     GetMCOTunables(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_GET_INVITATIONS:
    //     logger.info((node, info, ""));
    //     ClubGetInvitations(info, node);
    //
    //     break;
    //
    //   case MC_GET_PAYCHECKS:
    //     logger.info((node, info, ""));
    //     GetPaychecks(info, node);
    //
    //     break;
    //
    //   case MC_DEPOSIT_PAYCHECK:
    //     logger.info((node, info, ""));
    //     DepositPaycheck(info, node);
    //
    //     break;
    //
    //   case MC_GET_AD_INFO:
    //     logger.info((node, info, ""));
    //     GetAdInfo(info, node);
    //
    //     break;
    //
    //   case MC_SET_ALLOW_CLUB_INVITATIONS:
    //     logger.info((node, info, ""));
    //     SetAllowClubInvitations(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_MESSAGE_ALL:
    //     logger.info((node, info, ""));
    //     ClubMessageAll(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_REGISTER_CLUB:
    //     logger.info((node, info, ""));
    //     ClubRegisterClub(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_SET_SHOW_FLAGS:
    //     logger.info((node, info, ""));
    //     ClubSetShowFlags(info, node);
    //
    //     break;
    //
    //   case MC_CLUB_ASSIGN_TITLE:
    //     logger.info((node, info, ""));
    //     ClubAssignTitle(info, node);
    //
    //     break;
    //
    //   case MC_GET_MCOTS_HIGH_WATER_MARK:
    //     logger.info((node, info, ""));
    //     GetMCOTSHighWaterMark(info, node);
    //
    //     break;
    //
    //   case MC_CHECK_FOR_MCOTS_ALERTS:
    //     logger.info((node, info, ""));
    //     CheckForMCOTSAlerts(info, node);
    //
    //     break;
    //
    //   case MC_CRC_PRE_RACE_DATA:
    //     logger.info((node, info, ""));
    //     MCRaces_CRCPreRaceData(info, node);
    //
    //     break;
    //
    //   case MC_CRC_POST_RACE_DATA:
    //     logger.info((node, info, ""));
    //     MCRaces_CRCPostRaceData(info, node);
    //
    //     break;
    //
    //   case MC_CRC_PRE_RACE_DATA_TEST_DRIVE:
    //     logger.info((node, info, ""));
    //     MCRaces_CRCPreRaceDataTestDrive(info, node);
    //
    //     break;
    //
    //   case MC_CLASSIFIED_AD_CREATE:
    //     logger.info((node, info, ""));
    //     ClassifiedAdCreate(info, node);
    //
    //     break;
    //
    //   case MC_CLASSIFIED_AD_DELETE:
    //     logger.info((node, info, ""));
    //     ClassifiedAdDelete(info, node);
    //
    //     break;
    //
    //   case MC_CLASSIFIED_AD_GET_COUNT:
    //     logger.info((node, info, ""));
    //     ClassifiedAdGetCount(info, node);
    //
    //     break;
    //
    //   case MC_SET_PERSONA_DESCRIPTION:
    //     logger.info((node, info, ""));
    //     SetPlayerDescription(info, node);
    //
    //     break;
    //
    //   case MC_KNOWN_LOAD_TRANSACTION:
    //     logger.info((node, info, ""));
    //     MCKnownLoadTransaction(info, node);
    //
    //     break;
    //
    //   case MC_TRACKING_MSG:
    //     logger.info((node, info, ""));
    //     ClientTrackingMsg(info, node);
    //
    //     break;
    //
    //   case MC_TEST:
    //     SEPTest(info, node);
    //     break;

    default:
<<<<<<< HEAD
        logger.error(
            `Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(
                currentMsgNo
            )})  Predecrypt: ${preDecryptMsgNo} (${MSG_STRING(
                preDecryptMsgNo
            )}) conID: ${node.toFrom}  PersID: ${node.appID}`
        )
        //MCERROR(str); //NOCERROR(info, tNOCSeverity_WARNING, 50104, str);
        //RequestFailed(node, MC_MSG_NOT_HANDLED_BY_SERVER);
    }
    return result
=======
      logger.error(
        `Message Number Not Handled: ${currentMsgNo} (${MSG_STRING(
          currentMsgNo
        )})  Predecrypt: ${preDecryptMsgNo} (${MSG_STRING(
          preDecryptMsgNo
        )}) conID: ${node.toFrom}  PersID: ${node.appID}`
      );
    // MCERROR(str); //NOCERROR(info, tNOCSeverity_WARNING, 50104, str);
    // RequestFailed(node, MC_MSG_NOT_HANDLED_BY_SERVER);
  }
>>>>>>> master
}

// struct TCPManager
function TCPManager() {
  if (!(this instanceof TCPManager)) {
    return new TCPManager();
  }

  this.connectionID = 1;

  this.connections = [];
}

TCPManager.prototype.getFreeConnection = function getFreeConnection() {
  const con = Connection();
  con.id = this.connectionID;
  this.connectionID++;
  return con;
};

TCPManager.prototype.MessageReceived = function MessageReceived(msg, con) {
  logger.debug("In TCPManager::MessageReceived()");

  if (!con.useEncryption && msg.flags & 0x08) {
    con.useEncryption = 1;
    logger.debug("TCPMgr::MessageRecieved() turning on encryption\n");
  }

  // If not a Heartbeat
  if (!(msg.flags & 0x80) && con.useEncryption) {
    logger.debug("TCPMgr::MessageRecieved() Decrypt()\n");

    if (!con.enc) {
      logger.error(`KEncrypt ->enc is NULL! Disconnecting...conid: ${con.id}`);

<<<<<<< HEAD
    // If not a Heartbeat
    if (!(msg.flags & 0x80) && con.useEncryption) {
        logger.debug('TCPMgr::MessageRecieved() Decrypt()\n')

        if (!con.enc) {
            logger.error(
                `KEncrypt ->enc is NULL! Disconnecting...conid: ${con.id}`
            )

            con.sock.end()

            return
        }

        try {
            // if (!con.enc.IsSetupComplete()) {
            //     logger.error(
            //         `Decrypt() not yet setup! Disconnecting...conid: ${con.id}`
            //     )
            //     con.sock.end()
            //     return
            // }

            //con.enc.Decrypt(msg, con)
            console.log('Decoded: ', con.enc.decodeBuffer(msg.buffer))
        } catch (e) {
            logger.error(
                `Decrypt() exception thrown! Disconnecting...conid:${con.id}`
            )
            con.sock.end()
            throw e
        }
=======
      con.sock.end();

      return;
>>>>>>> master
    }

    try {
      if (!con.enc.IsSetupComplete()) {
        logger.error(
          `Decrypt() not yet setup! Disconnecting...conid: ${con.id}`
        );
        con.sock.end();
        return;
      }

      con.enc.Decrypt(msg, con);
    } catch (e) {
      logger.error(
        `Decrypt() exception thrown! Disconnecting...conid:${con.id}`
      );
      con.sock.end();
      throw e;
    }
  }

<<<<<<< HEAD
    ProcessInput(msg, con)
}
=======
  // Next thing we do is check to see if it's compressed.  If so, we uncompress it here.

  if (msg.flags & 0x02) {
    logger.debug("TCPMgr::MessageRecieved() Decompress()\n");

    // const comp = CompressedHeader(msg.buffer)
    // const newMsg = msg

    // unsigned decompSize = DecompressIt( comp->data, msg->header.length, newMsg->buffer, comp->uncompressedLength);
    // if (decompSize != comp->uncompressedLength)
    // {
    //   MCERROR("Size Mismatch on Message Decompress");
    //   ReleaseMsg(newMsg);
    //   ReleaseMsg(msg);
    //   return;
    // }
    //
    // ReleaseMsg(msg);
    // msg = newMsg;
    // msg->header.mcosig = *(unsigned long*)MCO_SIG_VAL;	// has to be proprietary!
  }

  ProcessInput(msg, "");
};
>>>>>>> master

module.exports = { TCPManager };
