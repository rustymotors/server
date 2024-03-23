import { login, loginComplete } from "./login.js";
import { trackingPing } from "./trackingPing.js";
import { clientConnect } from "./clientConnect.js";
import { getLobbies } from "./getLobbies.js";
import { _getOwnedVehicles } from "./_getOwnedVehicles.js";
import { _getPlayerInfo } from "./_getPlayerInfo.js";
import { _getPlayerPhysical } from "./_getPlayerPhysical.js";
import { _getOwnedParts } from "./_getOwnedParts.js";
import { _getPlayerRaceHistory } from "./_getPlayerRaceHistory.js";
import { _getTunables } from "./_getTunables.js";
import { _getGameUrls } from "./_getGameUrls.js";
import { _getArcadeCarInfo } from "./_getArcadeCarInfo.js";
import { _getStockCarInfo } from "./_getStockCarInfo.js";
import { _logout } from "./_logout.js";
import { _setOptions } from "./_setOptions.js";
import { _updatePlayerPhysical } from "./_updatePlayerPhysical.js";
import { _getCompleteVehicleInfo } from "./messageHandlers/_getCompleteVehicleInfo.js";
import { _updateCachedVehicle } from "./messageHandlers/_updateCachedVehicle.js";
import type { MessageHandler } from "../types.js";

export const messageHandlers: Map<number, MessageHandler> = new Map([
    [105, { name: "MC_LOGIN", handler: login, direction: "in" }],
    [106, { name: "MC_LOGOUT", handler: _logout, direction: "in" }],
    [
        108,
        {
            name: "MC_GET_PLAYER_INFO",
            handler: _getPlayerInfo,
            direction: "in",
        },
    ],
    [109, { name: "MC_SET_OPTIONS", handler: _setOptions, direction: "in" }],
    [122, { name: "MC_PLAYER_INFO", handler: _getPlayerInfo, direction: "in" }],
    [
        141,
        {
            name: "MC_STOCK_CAR_INFO",
            handler: _getStockCarInfo,
            direction: "in",
        },
    ],
    [
        145,
        {
            name: "MC_GET_COMPLETE_VEHICLE_INFO",
            handler: _getCompleteVehicleInfo,
            direction: "in",
        },
    ],
    [
        163,
        {
            name: "MC_UPDATE_CACHED_VEHICLE",
            handler: _updateCachedVehicle,
            direction: "in",
        },
    ],
    [
        172,
        {
            name: "MC_GET_OWNED_VEHICLES",
            handler: _getOwnedVehicles,
            direction: "in",
        },
    ],
    [
        173,
        {
            name: "MC_OWNED_VEHICLES_LIST",
            handler: _getOwnedVehicles,
            direction: "in",
        },
    ],
    [
        174,
        {
            name: "MC_GET_OWNED_PARTS",
            handler: _getOwnedParts,
            direction: "in",
        },
    ],
    [
        213,
        { name: "MC_LOGIN_COMPLETE", handler: loginComplete, direction: "out" },
    ],
    [
        264,
        {
            name: "MC_GET_PLAYER_PHYSICAL",
            handler: _getPlayerPhysical,
            direction: "in",
        },
    ],
    [
        265,
        {
            name: "MC_PLAYER_PHYSICAL_INFO",
            handler: _getPlayerPhysical,
            direction: "in",
        },
    ],
    [363, { name: "MC_GET_GAME_URLS", handler: _getGameUrls, direction: "in" }],
    [
        266,
        {
            name: "MC_UPDATE_PLAYER_PHYSICAL",
            handler: _updatePlayerPhysical,
            direction: "in",
        },
    ],
    [
        322,
        {
            name: "MC_GET_ARCADE_CARS",
            handler: _getArcadeCarInfo,
            direction: "in",
        },
    ],
    [324, { name: "MC_GET_LOBBIES", handler: getLobbies, direction: "in" }],
    [
        361,
        {
            name: "MC_GET_PLAYER_RACING_HISTORY",
            handler: _getPlayerRaceHistory,
            direction: "in",
        },
    ],
    [
        362,
        {
            name: "MC_PLAYER_RACING_HISTORY",
            handler: _getPlayerRaceHistory,
            direction: "in",
        },
    ],
    [
        389,
        { name: "MC_GET_MCO_TUNABLES", handler: _getTunables, direction: "in" },
    ],
    [
        438,
        {
            name: "MC_CLIENT_CONNECT_MSG",
            handler: clientConnect,
            direction: "in",
        },
    ],
    [440, { name: "MC_TRACKING_MSG", handler: trackingPing, direction: "in" }],
]);
