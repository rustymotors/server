import { parseArgs } from "node:util";
import { tpsInitializer } from "./mcCommon.js";
import { loggerStartup } from "./Logger.js";
import { ReadInput } from "./src/rebirth/threads/ReadInput.js";
import { SocketMgrCompletion } from "./src/rebirth/threads/SocketMgrCompletion.js";

export const MC_LOBBY_PORT = 7003;
export const MC_LOGIN_PORT = 8226;
export const MC_PERSONA_PORT = 8228;
export const MC_DB_CLIENT_PORT = 43300

const ALERT_Q = 1;
const LB_Q = 2;
export const INITIAL_CONNECTIONS = 20;

/**
 * @type Array<SubThread>}
*/
let activeSubThreads = [];

let disableLogins = false;
let mcDoShutdown = false;
let mcStatus = "Starting";

function mainShutdown() {
    console.log("Main thread finished.");
}

/**
 * 
 * @param {SubThread} subThread 
*/
export function onSubThreadShutdown(subThread) {
    activeSubThreads = activeSubThreads.filter((activeThread) => {
        return activeThread !== subThread;
    });
    
    if (activeSubThreads.length === 0) {
        mainShutdown();
    }
}

function main() {
    let error = false;
    let key;
    let extendedKey;
    let myOci;
    
    // Resord the server start time
    const startTime = new Date();
    
    // Parse the command line arguments
    const args = parseArgs();
    
    const { gTps, gTpsEchoed } = tpsInitializer();
    
    const logger = loggerStartup();
    
    console.log("Starting server...");
    console.log("Logins disabled.");
    disableLogins = true;
    
    console.log("This is the main thread.");
    process.stdin.on("data", (key) => {
        if (key.toString("utf8") === "x") {
            console.log("Shutting down...");
            mcDoShutdown = true;
            serverThread.emit("shutdown");
            readInputThread.emit("shutdown");
        }
    });
    
    const serverThread = new SocketMgrCompletion();
    serverThread.on("shutdownComplete", () => {
        onSubThreadShutdown(serverThread);
    });
    activeSubThreads.push(serverThread);

    const readInputThread = new ReadInput();
    readInputThread.on("shutdownComplete", () => {
        onSubThreadShutdown(readInputThread);
    });
    activeSubThreads.push(readInputThread);
}

main();

