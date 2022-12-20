export type NpsCommandMap = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};

/**
 * Commands from the game client to the game server
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */

export const NPS_LOBBYCLIENT_COMMANDS: NpsCommandMap[] = [
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
