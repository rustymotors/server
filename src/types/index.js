"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.EMessageDirection = exports.NPS_COMMANDS = exports.NPS_LOGIN_COMMANDS = exports.CompressedHeader = exports.BaseMessageHeader = exports.MessageHead = exports.NPS_GetPersonaMapListRequest = exports.GenericReply = exports.GLDP_PersonaList = exports._UserGameData = exports.GLDP_Persona = exports.LobbyInfo = exports.LobbyMessage = exports._NPS_RiffInfo = exports._NPS_RiffListHeader = void 0;
exports._NPS_RiffListHeader = {
    StructSize: Buffer.alloc(4),
    NumRiffs: Buffer.alloc(4)
};
exports._NPS_RiffInfo = {
    Riff: Buffer.alloc(32),
    Protocol: Buffer.alloc(4),
    CommId: Buffer.alloc(4),
    Password: Buffer.alloc(17),
    ChannelType: Buffer.alloc(4),
    ConnectedUsers: Buffer.alloc(4),
    OpenChannels: Buffer.alloc(4),
    UserIsConnected: Buffer.alloc(4),
    ChannelData: Buffer.alloc(256),
    NumberOfReadyPlayers: Buffer.alloc(4),
    MaxReadyPlayers: Buffer.alloc(4),
    MasterUserId: Buffer.alloc(4),
    GameServerISRunning: Buffer.alloc(1)
};
exports.LobbyMessage = {
    msgNo: Buffer.alloc(4),
    noLobbies: Buffer.alloc(4),
    moreToCome: Buffer.alloc(4),
    lobbyInfo: Buffer.alloc(142)
};
exports.LobbyInfo = {
    lobbyID: Buffer.alloc(4),
    raceTypeID: Buffer.alloc(4),
    turfID: Buffer.alloc(4),
    NPSRiffName: Buffer.alloc(32),
    eTurfName: Buffer.alloc(256),
    clientArt: Buffer.alloc(11),
    elementID: Buffer.alloc(4),
    turfLength: Buffer.alloc(4),
    startSlice: Buffer.alloc(4),
    endSlice: Buffer.alloc(4),
    dragStageLeft: Buffer.alloc(4),
    dragStageRight: Buffer.alloc(4),
    dragStagingSlice: Buffer.alloc(4),
    gridSpreadFactor: Buffer.alloc(4),
    linear: Buffer.alloc(4),
    numplayersmin: Buffer.alloc(4),
    numplayersmax: Buffer.alloc(4),
    numplayersdefault: Buffer.alloc(4),
    bnumplayersenabled: Buffer.alloc(4),
    numlapsmin: Buffer.alloc(4),
    numlapsmax: Buffer.alloc(4),
    numlapsdefault: Buffer.alloc(4),
    bnumlapsenabled: Buffer.alloc(4),
    numroundsmin: Buffer.alloc(4),
    numroundsmax: Buffer.alloc(4),
    numroundsdefault: Buffer.alloc(4),
    bnumroundsenabled: Buffer.alloc(4),
    bweatherdefault: Buffer.alloc(4),
    bweatherenabled: Buffer.alloc(4),
    bnightdefault: Buffer.alloc(4),
    bnightenabled: Buffer.alloc(4),
    bbackwardsdefault: Buffer.alloc(4),
    bbackwardsenabled: Buffer.alloc(4),
    btrafficdefault: Buffer.alloc(4),
    btrafficenabled: Buffer.alloc(4),
    bdamagedefault: Buffer.alloc(4),
    bdamageenabled: Buffer.alloc(4),
    baidefault: Buffer.alloc(4),
    baienabled: Buffer.alloc(4),
    topDog: Buffer.alloc(13),
    turfOwner: Buffer.alloc(33),
    qualifyingTime: Buffer.alloc(4),
    clubNumPlayers: Buffer.alloc(4),
    clubNumLaps: Buffer.alloc(4),
    blubNumRounds: Buffer.alloc(4),
    clubNight: Buffer.alloc(4),
    clubWeather: Buffer.alloc(4),
    clubBackwards: Buffer.alloc(4),
    bestLapTime: Buffer.alloc(4),
    lobbyDifficulty: Buffer.alloc(4),
    ttPointForQualify: Buffer.alloc(4),
    ttCashForQualify: Buffer.alloc(4),
    ttPointBonusFasterIncs: Buffer.alloc(4),
    ttCashBonusFasterIncs: Buffer.alloc(4),
    ttTimeIncrements: Buffer.alloc(4),
    ttvictory_1st_points: Buffer.alloc(4),
    ttvictory_1st_cash: Buffer.alloc(4),
    ttvictory_2nd_points: Buffer.alloc(4),
    ttvictory_2nd_cash: Buffer.alloc(4),
    ttvictory_3rd_points: Buffer.alloc(4),
    ttvictory_3rd_cash: Buffer.alloc(4),
    minLevel: Buffer.alloc(4),
    minResetSlice: Buffer.alloc(4),
    maxResetSlice: Buffer.alloc(4),
    newbieFlag: Buffer.alloc(4),
    driverHelmetFlag: Buffer.alloc(4),
    clubNumPlayersMax: Buffer.alloc(4),
    clubNumPlayersMin: Buffer.alloc(4),
    clubNumPlayersDefault: Buffer.alloc(4),
    numClubsMax: Buffer.alloc(4),
    numClubsMin: Buffer.alloc(4),
    racePointsFactor: Buffer.alloc(4),
    bodyClassMax: Buffer.alloc(4),
    powerClassMax: Buffer.alloc(4),
    partPrizesMax: Buffer.alloc(4),
    partPrizesWon: Buffer.alloc(4),
    clubLogoID: Buffer.alloc(4),
    bteamtrialweather: Buffer.alloc(4),
    bteamtrialnight: Buffer.alloc(4),
    bteamtrialbackwards: Buffer.alloc(4),
    teamtrialnumlaps: Buffer.alloc(4),
    teamtrialbaseTUP: Buffer.alloc(4),
    raceCashFactor: Buffer.alloc(4)
};
exports.GLDP_Persona = {
    customerId_: Buffer.alloc(4),
    personaId_: Buffer.alloc(4),
    creationDate_: Buffer.alloc(4),
    personaName_: Buffer.alloc(33)
};
exports._UserGameData = {
    CustomerId: Buffer.alloc(4),
    GameUserName: Buffer.alloc(33),
    ServerDataId: Buffer.alloc(4),
    CreateDate: Buffer.alloc(4),
    LastLogin: Buffer.alloc(4),
    NumGames: Buffer.alloc(4),
    GameUserId: Buffer.alloc(4),
    IsOnSystem: Buffer.alloc(4),
    GamePurchaseDate: Buffer.alloc(4),
    GameSerialNumber: Buffer.alloc(33),
    TimeOnline: Buffer.alloc(4),
    TimeInGame: Buffer.alloc(4),
    GameSpecific: Buffer.alloc(512),
    PersonalBlob: Buffer.alloc(256),
    PictureBlob: Buffer.alloc(1),
    DND: Buffer.alloc(4),
    GameStart: Buffer.alloc(4),
    CurrentKey: Buffer.alloc(400),
    PersonaLevle: Buffer.alloc(4),
    ShardId: Buffer.alloc(4)
};
exports.GLDP_PersonaList = {
    NPS_SerializeList: Buffer.alloc(48),
    maxPersonas_: Buffer.alloc(4)
};
exports.GenericReply = {
    msgNo: Buffer.alloc(4),
    msgReply: Buffer.alloc(4),
    result: Buffer.alloc(4),
    data: Buffer.alloc(4),
    data2: Buffer.alloc(4)
};
exports.NPS_GetPersonaMapListRequest = {
    NPS_SerializeList: Buffer.alloc(48),
    customerId_: Buffer.alloc(4)
};
/**
 * @property {Buffer} _length
 * @property {Buffer} _mcosig
 */
var MessageHead = /** @class */ (function () {
    /**
     *
     */
    function MessageHead() {
        // This is a 4B in the debug binary, the client is sending 2B
        /** @type {Buffer} */
        this._length = Buffer.alloc(2); // UInt4B
        /** @type {Buffer} */
        this._mcosig = Buffer.alloc(4); // UInt4B
    }
    return MessageHead;
}());
exports.MessageHead = MessageHead;
exports.BaseMessageHeader = {
    msgNo: Buffer.alloc(4)
};
exports.CompressedHeader = {
    uncompressedLength: Buffer.alloc(4),
    data: Buffer.alloc(0)
};
/**
 * Commands from the game server to the game client
 */
var NPS_LOBBYSERVER_COMMANDS = [
    { name: "NPS_FORCE_LOGOFF", value: 513, module: "Lobby" },
    { name: "NPS_USER_LEFT", value: 514, module: "Lobby" },
    { name: "NPS_USER_JOINED", value: 515, module: "Lobby" },
    { name: "NPS_USER_INFO", value: 516, module: "Lobby" },
    { name: "NPS_SYSTEM_ALERT", value: 517, module: "Lobby" },
    { name: "NPS_CLIENT_COUNT", value: 518, module: "Lobby" },
    { name: "NPS_ACK", value: 519, module: "Lobby" },
    { name: "NPS_USER_LEFT_CHANNEL", value: 520, module: "Lobby" },
    { name: "NPS_CHANNEL_CLOSED", value: 521, module: "Lobby" },
    { name: "NPS_DUP_USER", value: 522, module: "Lobby" },
    { name: "NPS_SERVER_FULL", value: 523, module: "Lobby" },
    { name: "NPS_USER_JOINED_CHANNEL", value: 524, module: "Lobby" },
    { name: "NPS_SERVER_INFO", value: 525, module: "Lobby" },
    { name: "NPS_CHANNEL_CREATED", value: 526, module: "Lobby" },
    { name: "NPS_CHANNEL_DELETED", value: 527, module: "Lobby" },
    { name: "NPS_READY_LIST", value: 528, module: "Lobby" },
    { name: "NPS_USER_LIST", value: 529, module: "Lobby" },
    { name: "NPS_SERVER_LIST", value: 530, module: "Lobby" },
    { name: "NPS_CHANNEL_DENIED", value: 531, module: "Lobby" },
    { name: "NPS_CHANNEL_GRANTED", value: 532, module: "Lobby" },
    { name: "NPS_CHANNEL_CONDITIONAL", value: 533, module: "Lobby" },
    { name: "NPS_SERVER_REDIRECT", value: 534, module: "Lobby" },
    { name: "NPS_HEARTBEAT", value: 535, module: "Lobby" },
    { name: "NPS_HEARTBEAT_TIMEOUT", value: 536, module: "Lobby" },
    { name: "NPS_CHANNEL_UPDATE", value: 537, module: "Lobby" },
    { name: "NPS_FORCE_LEAVE_CHANNEL", value: 538, module: "Lobby" },
    { name: "NPS_USER_LOCATION", value: 539, module: "Lobby" },
    { name: "NPS_GAME_SERVER_STARTED", value: 540, module: "Lobby" },
    { name: "NPS_GAME_SERVER_TERMINATED", value: 541, module: "Lobby" },
    { name: "NPS_VERSIONS_DIFFERENT", value: 542, module: "Lobby" },
    { name: "NPS_SEND_VERSION_STRING", value: 543, module: "Lobby" },
    { name: "NPS_GAME_SKU_REGISTRY_KEY", value: 544, module: "Lobby" },
    { name: "NPS_PLUGIN_ACK", value: 545, module: "Lobby" },
    { name: "NPS_SERVER_CRASHED", value: 546, module: "Lobby" },
    { name: "NPS_OPEN_COMM_CHANNEL_ACK", value: 547, module: "Lobby" },
    { name: "NPS_GAME_SERVER_STATE_CHANGE", value: 548, module: "Lobby" },
    { name: "NPS_SLOT_UPDATE", value: 549, module: "Lobby" },
    { name: "NPS_SLOT_LIST", value: 550, module: "Lobby" },
    { name: "NPS_CHANNEL_MASTER", value: 551, module: "Lobby" },
    { name: "NPS_CHANNEL_MASTER_LIST", value: 552, module: "Lobby" },
    { name: "NPS_MINI_USER_LIST", value: 553, module: "Lobby" },
    { name: "NPS_INVALID_KEY", value: 554, module: "Lobby" },
    { name: "NPS_NO_VALIDATION_SERVER", value: 555, module: "Lobby" },
    { name: "NPS_INC_MINI_USER_LIST", value: 556, module: "Lobby" },
    { name: "NPS_DEC_MINI_USER_LIST", value: 557, module: "Lobby" },
    { name: "NPS_BUDDY_LIST", value: 558, module: "Lobby" },
    { name: "NPS_BUDDYLIST_UPDATE", value: 559, module: "Lobby" },
];
/**
 * Commands from the game client to the game server
 */
var NPS_LOBBYCLIENT_COMMANDS = [
    { name: "NPS_LOGIN", value: 256, module: "Lobby" },
    { name: "NPS_GET_USER_LIST", value: 257, module: "Lobby" },
    { name: "NPS_GET_MY_USER_DATA", value: 258, module: "Lobby" },
    { name: "NPS_SET_MY_USER_DATA", value: 259, module: "Lobby" },
    { name: "NPS_LOG_OFF_SERVER", value: 260, module: "Lobby" },
    { name: "NPS_CLOSE_COMM_CHANNEL", value: 261, module: "Lobby" },
    { name: "NPS_OPEN_COMM_CHANNEL", value: 262, module: "Lobby" },
    { name: "NPS_GET_CLIENT_COUNT", value: 263, module: "Lobby" },
    { name: "NPS_START_GAME", value: 264, module: "Lobby" },
    { name: "NPS_READY_FOR_GAME", value: 265, module: "Lobby" },
    { name: "NPS_START_GAME_SERVER", value: 266, module: "Lobby" },
    { name: "NPS_SET_SLEEP_STATE", value: 267, module: "Lobby" },
    { name: "NPS_GET_SERVER_INFO", value: 268, module: "Lobby" },
    { name: "NPS_SET_COMM_FLAGS", value: 269, module: "Lobby" },
    { name: "NPS_GET_READY_LIST", value: 270, module: "Lobby" },
    { name: "NPS_SEND_SERVER_LIST", value: 271, module: "Lobby" },
    { name: "NPS_SET_COMM_CHANNEL_RATE", value: 272, module: "Lobby" },
    { name: "NPS_SET_HEARTBEAT_TIMEOUT", value: 273, module: "Lobby" },
    { name: "NPS_GET_HEARTBEAT_TIMEOUT", value: 274, module: "Lobby" },
    { name: "NPS_SET_CHANNEL_DATA", value: 275, module: "Lobby" },
    { name: "NPS_FILE_START", value: 276, module: "Lobby" },
    { name: "NPS_FILE_DATA", value: 277, module: "Lobby" },
    { name: "NPS_FILE_COMPLETED", value: 278, module: "Lobby" },
    { name: "NPS_BOOT_USER_FROM_CHANNEL", value: 279, module: "Lobby" },
    { name: "NPS_LOCATE_USER", value: 280, module: "Lobby" },
    { name: "NPS_ENABLE_FILTER", value: 281, module: "Lobby" },
    { name: "NPS_DISABLE_FILTER", value: 282, module: "Lobby" },
    { name: "NPS_SLEEP_SERVER", value: 283, module: "Lobby" },
    { name: "NPS_WAKE_SERVER", value: 284, module: "Lobby" },
    { name: "NPS_TERMINATE_GAME_SERVER", value: 285, module: "Lobby" },
    { name: "NPS_SEND_SKU_REGISTRY", value: 286, module: "Lobby" },
    { name: "NPS_SET_READY_FOR_GAME", value: 287, module: "Lobby" },
    { name: "NPS_LOGIN_RESP", value: 288, module: "Lobby" },
    { name: "NPS_SOCKET_RECONNECT", value: 289, module: "Lobby" },
    { name: "NPS_SET_SLOT", value: 290, module: "Lobby" },
    { name: "NPS_GET_SLOT_LIST", value: 291, module: "Lobby" },
    { name: "NPS_SET_CHANNEL_CLOSED", value: 292, module: "Lobby" },
    { name: "NPS_UDP_STATUS", value: 293, module: "Lobby" },
    { name: "NPS_GET_USER_INFO", value: 294, module: "Lobby" },
    { name: "NPS_GET_MASTER_LIST", value: 295, module: "Lobby" },
    { name: "NPS_GET_MINI_USER_LIST", value: 296, module: "Lobby" },
    { name: "NPS_UDP_FAILURE", value: 297, module: "Lobby" },
    { name: "NPS_BUDDYLIST_REFRESH", value: 298, module: "Lobby" },
    { name: "NPS_BUDDYLIST_ADD_USERS", value: 299, module: "Lobby" },
    { name: "NPS_BUDDYLIST_REMOVE_USERS", value: 300, module: "Lobby" },
];
/**
 * Commands from the game client to the login server
 */
var NPS_LOGINCLIENT_COMMANDS = [
    { name: "NPS_USER_LOGIN", value: 1281, module: "Login" },
    { name: "NPS_GAME_LOGIN", value: 1282, module: "Login" },
    { name: "NPS_REGISTER_GAME_LOGIN", value: 1283, module: "Login" },
    { name: "NPS_SET_GAME_BLOB", value: 1284, module: "Login" },
    { name: "NPS_GET_NEXT_SERVER", value: 1285, module: "Login" },
    { name: "NPS_NEW_EA_ACCOUNT", value: 1286, module: "Login" },
    { name: "NPS_NEW_GAME_ACCOUNT", value: 1287, module: "Login" },
    { name: "NPS_UPDATE_EA_ACCOUNT", value: 1288, module: "Login" },
    { name: "NPS_UPDATE_GAME_ACCOUNT", value: 1289, module: "Login" },
    { name: "NPS_LOCATE_PLAYER", value: 1290, module: "Login" },
    { name: "NPS_GET_BUDDY_LIST", value: 1291, module: "Login" },
    { name: "NPS_ADD_BUDDY_LIST", value: 1292, module: "Login" },
    { name: "NPS_DELETE_BUDDY_LIST", value: 1293, module: "Login" },
    { name: "NPS_CLEAR_BUDDY_LIST", value: 1294, module: "Login" },
    { name: "NPS_REGISTER_GAME_LOGOUT", value: 1295, module: "Login" },
    { name: "NPS_GET_GENERIC_HS_DATA", value: 1296, module: "Login" },
    { name: "NPS_PUT_GENERIC_HS_DATA", value: 1297, module: "Login" },
    { name: "NPS_DELETE_GAME_PERSONA", value: 1298, module: "Login" },
    { name: "NPS_READ_SERVER_DATA_LIST", value: 1299, module: "Login" },
    { name: "NPS_DELETE GENERIC_HS_DATA", value: 1300, module: "Login" },
    { name: "NPS_GET_PLAYER_RANK", value: 1301, module: "Login" },
    { name: "NPS_GET_TOP_PLAYERS", value: 1302, module: "Login" },
    { name: "NPS_ADD_BUDDY_BY_NAME", value: 1303, module: "Login" },
    { name: "NPS_GET_BUDDY_INFO", value: 1304, module: "Login" },
    { name: "NPS_GET_PERSONA_INFO", value: 1305, module: "Login" },
    { name: "NPS_GET_LEADER_BOARD", value: 1306, module: "Login" },
    { name: "NPS_SRP_USERNAME", value: 1307, module: "Login" },
    { name: "NPS_SRP_NGS", value: 1308, module: "Login" },
    { name: "NPS_SRP_A", value: 1309, module: "Login" },
    { name: "NPS_SRP_B", value: 1310, module: "Login" },
    { name: "NPS_SRP_USER_VERIFY", value: 1311, module: "Login" },
    { name: "NPS_SRP_SERVER_VERIFY", value: 1312, module: "Login" },
    { name: "NPS_FILE_BUG_REPORT", value: 1313, module: "Login" },
    { name: "NPS_GET_GENERIC_FIELD_RANKING", value: 1314, module: "Login" },
    { name: "NPS_SEND_EMAIL", value: 1315, module: "Login" },
    { name: "NPS_RECEIVE_EMAIL", value: 1316, module: "Login" },
    { name: "NPS_DELETE_EMAILS", value: 1317, module: "Login" },
    { name: "NPS_LIST_EMAILS", value: 1318, module: "Login" },
    { name: "NPS_AAI_REQUEST", value: 1328, module: "Login" },
    { name: "NPS_AAI_CRACK", value: 1329, module: "Login" },
    { name: "NPS_GET_PERSONA_MAPS", value: 1330, module: "Login" },
    { name: "NPS_VALIDATE_PERSONA_NAME", value: 1331, module: "Login" },
    { name: "NPS_CHECK_TOKEN", value: 1332, module: "Login" },
    { name: "NPS_GET_USER_STATUS", value: 1333, module: "Login" },
];
var NPS_LOBBY_COMMANDS = __spreadArray(__spreadArray([], NPS_LOBBYCLIENT_COMMANDS, true), NPS_LOBBYSERVER_COMMANDS, true);
exports.NPS_LOGIN_COMMANDS = __spreadArray([], NPS_LOGINCLIENT_COMMANDS, true);
exports.NPS_COMMANDS = __spreadArray(__spreadArray(__spreadArray([], NPS_LOBBY_COMMANDS, true), NPS_LOGINCLIENT_COMMANDS, true), [
    { name: "NPS_CRYPTO_DES_CBC", value: 4353, module: "Lobby" },
], false);
/**
 * @typedef {'RECEIVED' | 'SENT'} MESSAGE_DIRECTION
 *
 */
var EMessageDirection;
(function (EMessageDirection) {
    EMessageDirection["RECEIVED"] = "received";
    EMessageDirection["SENT"] = "sent";
})(EMessageDirection = exports.EMessageDirection || (exports.EMessageDirection = {}));
