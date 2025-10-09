import { BytableMessage } from "@rustymotors/binary";
import {
    getServerLogger,
    Serializable,
    ServerLogger,
} from "rusty-motors-shared";
import { CBlock, CString } from "../../../shared/src/helpers.js";

export class OpenCommChannelRequest implements Serializable {
    private _connectionId // 4
    private _commId // 4
    private _protocol // 4
    private _riffName // string 32
    private _password // string 17
    private _channelData // 256
    private _key // 4
    private _flags // 4

    constructor() {
        this._connectionId = Buffer.alloc(4)
        this._commId = Buffer.alloc(4)
        this._protocol = Buffer.alloc(4)
        this._riffName = new CString(32)
        this._password = new CString(17)
        this._channelData = new CBlock(256)
        this._key = Buffer.alloc(4)
        this.

    }
}

export async function handleOpenCommChannel({
    connectionId,
    message,
    log = getServerLogger("lobby.handleOpenCommChannel"),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    message: BytableMessage;
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_OPEN_COMM_CHANNEL`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.messageId}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([
            { name: "commId", field: "Dword" },
            { name: "riffName", field: "String" },
            { name: "slotNumber", field: "Dword" },
            { name: "slotFlags", field: "Dword" }
        ]);
        incomingRequest.deserialize(message.serialize());

        const requestedCommId = incomingRequest.getFieldValueByName("commId") ?? -1
        const requestedRiffName = incomingRequest.getFieldValueByName("riffName") ?? ""

        log.debug(
            `[${connectionId}] Requested we open a channel on ${requestedRiffName}(${(requestedCommId as Buffer).readInt32BE()})`,
        );

        // TODO: Actually have servers
        const packetResult = createNPSChannelGrantedPacket((requestedCommId as Buffer).readInt32BE(), 7003)
        log.debug(`[${connectionId}]  Sending comm GRANTED: ${JSON.stringify(packetResult)}`)


        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_OPEN_COMM_CHANNEL: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}

export function createNPSChannelGrantedPacket(commId: number, commPort: number) {
            
        
        // ll
        const outgoingGameMessage = new BytableMessage();
        outgoingGameMessage.setSerializeOrder([
            { name: "commId", field: "Dword" },
            { name: "port", field: "Dword" },
        ]);

        outgoingGameMessage.header.setMessageId(0x214);
        outgoingGameMessage.setVersion(0);
        outgoingGameMessage.setFieldValueByName("commId", commId);
        outgoingGameMessage.setFieldValueByName(
            "port",
            commPort
        );

        // Build the packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([
            { name: "data", field: "Buffer" },
        ]);
        packetResult.setVersion(0);
        packetResult.deserialize(outgoingGameMessage.serialize());

        return packetResult

}