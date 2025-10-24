import { BytableMessage } from '@rustymotors/binary';
import {
    CBlock,
    checkMinLength,
    CString,
    getServerLogger,
    Serializable,
    ServerLogger,
    sliceBuff,
} from 'rusty-motors-shared';

export class OpenCommChannelRequest implements Serializable {
    private _connectionId; // 4
    private _commId; // 4
    private _protocol; // 4
    private _riffName; // string 32
    private _password; // string 17
    private _channelData; // 256
    private _key; // 4
    private _flags; // 4

    constructor() {
        this._connectionId = Buffer.alloc(4);
        this._commId = Buffer.alloc(4);
        this._protocol = Buffer.alloc(4);
        this._riffName = new CString(32);
        this._password = new CString(17);
        this._channelData = new CBlock(256);
        this._key = Buffer.alloc(4);
        this._flags = Buffer.alloc(4);
    }

    get sizeOf() {
        return 268 + this._riffName.sizeOf + this._password.sizeOf;
    }

    serialize() {
        return Buffer.concat([
            this._connectionId,
            this._commId,
            this._protocol,
            this._riffName.serialize(),
            this._password.serialize(),
            this._channelData.serialize(),
            this._key,
            this._flags,
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._connectionId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._commId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._protocol = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._riffName.deserialize(buf.subarray(offset));
        offset = offset + this._riffName.sizeOf;
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._channelData.deserialize(sliceBuff(buf, offset, 256));
        offset = offset + this._channelData.sizeOf;
        this._key = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._flags = sliceBuff(buf, offset, 4);
        offset = offset + 4;
    }

    toString() {
        return JSON.stringify(this);
    }
}

export async function handleOpenCommChannel({
    connectionId,
    message,
    log = getServerLogger('lobby.handleOpenCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_OPEN_COMM_CHANNEL`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.messageId}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'riffName', field: 'String' },
            { name: 'slotNumber', field: 'Dword' },
            { name: 'slotFlags', field: 'Dword' },
        ]);
        incomingRequest.deserialize(message.serialize());

        const requestedCommId =
            incomingRequest.getFieldValueByName('commId') ?? -1;
        const requestedRiffName =
            incomingRequest.getFieldValueByName('riffName') ?? '';

        log.debug(
            `[${connectionId}] Requested we open a channel on ${requestedRiffName}(${(requestedCommId as Buffer).readInt32BE()})`,
        );

        // TODO: Actually have servers
        const port = Number.parseInt(connectionId.split(":")[1] ?? '7003')

        const packetResult = createNPSChannelGrantedPacket(
            (requestedCommId as Buffer).readInt32BE(),
            port,
        );
        log.debug(
            `[${connectionId}]  Sending comm GRANTED: ${JSON.stringify(packetResult)}`,
        );

        return {
            connectionId,
            messages: [packetResult],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_OPEN_COMM_CHANNEL: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}

export function createNPSChannelGrantedPacket(
    commId: number,
    commPort: number,
) {
    // ll
    const outgoingGameMessage = new BytableMessage();
    outgoingGameMessage.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'port', field: 'Dword' },
    ]);

    outgoingGameMessage.header.setMessageId(0x214);
    outgoingGameMessage.setVersion(0);
    outgoingGameMessage.setFieldValueByName('commId', commId);
    outgoingGameMessage.setFieldValueByName('port', commPort);

    // Build the packet
    const packetResult = new BytableMessage();
    packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packetResult.setVersion(0);
    packetResult.deserialize(outgoingGameMessage.serialize());

    return packetResult;
}
