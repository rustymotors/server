import {
	BinaryMember,
	CString,
	Uint16_t,
	Uint32_t,
	Uint8_t,
} from "@rustymotors/binary";

export class ChannelData extends BinaryMember {
	constructor() {
		super();
		this.maxSize = 256;
		this.value = Buffer.alloc(this.maxSize);
	}
}

export class CommData extends BinaryMember {
	private commId = new Uint32_t();
	private riff = new CString(32);
	private slotNumber = new Uint32_t();
	private slotFlags = new Uint32_t();
	private port = new Uint32_t();
	private protocol = new Uint32_t();
	private userId = new Uint32_t();
	private connectedUserCount = new Uint16_t();
	private openChnnelsCount = new Uint16_t();
	private userCanBeMadeReady = new Uint16_t();
	private userIsReady = new Uint16_t();
	private IsChannelOperator = new Uint16_t();
	private channeltype = new Uint16_t();
	private disableBacklog = new Uint8_t();
	private gamneServerIsRunning = new Uint8_t();
	private shouldLaunchGameServer = new Uint32_t();
	private maxReadyUsers = new Uint16_t();
	private sku = new Uint32_t();
	private sendRate = new Uint32_t();
	private channelData = new ChannelData();
	private flags = new Uint32_t();
	private messageOnListen = new Uint16_t();
	private isBeingRemoved = new Uint16_t();
	private numberOMessagesToSend = new Uint16_t();

	constructor() {
		super();
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.size());
        let offset = 0;
        this.commId.serialize().copy(buffer, offset);
        offset += this.commId.size();
        this.riff.serialize().copy(buffer, offset);
        offset += this.riff.size();
        this.slotNumber.serialize().copy(buffer, offset);
        offset += this.slotNumber.size();
        this.slotFlags.serialize().copy(buffer, offset);
        offset += this.slotFlags.size();
        this.port.serialize().copy(buffer, offset);
        offset += this.port.size();
        this.protocol.serialize().copy(buffer, offset);
        offset += this.protocol.size();
        this.userId.serialize().copy(buffer, offset);
        offset += this.userId.size();
        this.connectedUserCount.serialize().copy(buffer, offset);
        offset += this.connectedUserCount.size();
        this.openChnnelsCount.serialize().copy(buffer, offset);
        offset += this.openChnnelsCount.size();
        this.userCanBeMadeReady.serialize().copy(buffer, offset);
        offset += this.userCanBeMadeReady.size();
        this.userIsReady.serialize().copy(buffer, offset);
        offset += this.userIsReady.size();
        this.IsChannelOperator.serialize().copy(buffer, offset);
        offset += this.IsChannelOperator.size();
        this.channeltype.serialize().copy(buffer, offset);
        offset += this.channeltype.size();
        this.disableBacklog.serialize().copy(buffer, offset);
        offset += this.disableBacklog.size();
        this.gamneServerIsRunning.serialize().copy(buffer, offset);
        offset += this.gamneServerIsRunning.size();
        this.shouldLaunchGameServer.serialize().copy(buffer, offset);
        offset += this.shouldLaunchGameServer.size();
        this.maxReadyUsers.serialize().copy(buffer, offset);
        offset += this.maxReadyUsers.size();
        this.sku.serialize().copy(buffer, offset);
        offset += this.sku.size();
        this.sendRate.serialize().copy(buffer, offset);
        offset += this.sendRate.size();
        this.channelData.serialize().copy(buffer, offset);
        offset += this.channelData.size();
        this.flags.serialize().copy(buffer, offset);
        offset += this.flags.size();
        this.messageOnListen.serialize().copy(buffer, offset);
        offset += this.messageOnListen.size();
        this.isBeingRemoved.serialize().copy(buffer, offset);
        offset += this.isBeingRemoved.size();
        this.numberOMessagesToSend.serialize().copy(buffer, offset);
        offset += this.numberOMessagesToSend.size();
        return buffer;
	}

	override deserialize(buffer: Buffer): void {
		let offset = 0;
		this.commId.deserialize(
			buffer.subarray(offset, offset + this.commId.size()),
		);
		offset += this.commId.size();
		this.riff.deserialize(buffer.subarray(offset, offset + this.riff.size()));
		offset += this.riff.size();
		this.slotNumber.deserialize(
			buffer.subarray(offset, offset + this.slotNumber.size()),
		);
		offset += this.slotNumber.size();
		this.slotFlags.deserialize(
			buffer.subarray(offset, offset + this.slotFlags.size()),
		);
		offset += this.slotFlags.size();
		this.port.deserialize(buffer.subarray(offset, offset + this.port.size()));
		offset += this.port.size();
		this.protocol.deserialize(
			buffer.subarray(offset, offset + this.protocol.size()),
		);
		offset += this.protocol.size();
		this.userId.deserialize(
			buffer.subarray(offset, offset + this.userId.size()),
		);
		offset += this.userId.size();
		this.connectedUserCount.deserialize(
			buffer.subarray(offset, offset + this.connectedUserCount.size()),
		);
		offset += this.connectedUserCount.size();
		this.openChnnelsCount.deserialize(
			buffer.subarray(offset, offset + this.openChnnelsCount.size()),
		);
		offset += this.openChnnelsCount.size();
		this.userCanBeMadeReady.deserialize(
			buffer.subarray(offset, offset + this.userCanBeMadeReady.size()),
		);
		offset += this.userCanBeMadeReady.size();
		this.userIsReady.deserialize(
			buffer.subarray(offset, offset + this.userIsReady.size()),
		);
		offset += this.userIsReady.size();
		this.IsChannelOperator.deserialize(
			buffer.subarray(offset, offset + this.IsChannelOperator.size()),
		);
		offset += this.IsChannelOperator.size();
		this.channeltype.deserialize(
			buffer.subarray(offset, offset + this.channeltype.size()),
		);
		offset += this.channeltype.size();
		this.disableBacklog.deserialize(
			buffer.subarray(offset, offset + this.disableBacklog.size()),
		);
		offset += this.disableBacklog.size();
		this.gamneServerIsRunning.deserialize(
			buffer.subarray(offset, offset + this.gamneServerIsRunning.size()),
		);
		offset += this.gamneServerIsRunning.size();
		this.shouldLaunchGameServer.deserialize(
			buffer.subarray(offset, offset + this.shouldLaunchGameServer.size()),
		);
		offset += this.shouldLaunchGameServer.size();
		this.maxReadyUsers.deserialize(
			buffer.subarray(offset, offset + this.maxReadyUsers.size()),
		);
		offset += this.maxReadyUsers.size();
		this.sku.deserialize(buffer.subarray(offset, offset + this.sku.size()));
		offset += this.sku.size();
		this.sendRate.deserialize(
			buffer.subarray(offset, offset + this.sendRate.size()),
		);
		offset += this.sendRate.size();
		this.channelData.deserialize(
			buffer.subarray(offset, offset + this.channelData.size()),
		);
		offset += this.channelData.size();
		this.flags.deserialize(buffer.subarray(offset, offset + this.flags.size()));
		offset += this.flags.size();
		this.messageOnListen.deserialize(
			buffer.subarray(offset, offset + this.messageOnListen.size()),
		);
		offset += this.messageOnListen.size();
		this.isBeingRemoved.deserialize(
			buffer.subarray(offset, offset + this.isBeingRemoved.size()),
		);
		offset += this.isBeingRemoved.size();
		this.numberOMessagesToSend.deserialize(
			buffer.subarray(offset, offset + this.numberOMessagesToSend.size()),
		);
	}

    override size(): number {
        return (
            this.commId.size() +
            this.riff.size() +
            this.slotNumber.size() +
            this.slotFlags.size() +
            this.port.size() +
            this.protocol.size() +
            this.userId.size() +
            this.connectedUserCount.size() +
            this.openChnnelsCount.size() +
            this.userCanBeMadeReady.size() +
            this.userIsReady.size() +
            this.IsChannelOperator.size() +
            this.channeltype.size() +
            this.disableBacklog.size() +
            this.gamneServerIsRunning.size() +
            this.shouldLaunchGameServer.size() +
            this.maxReadyUsers.size() +
            this.sku.size() +
            this.sendRate.size() +
            this.channelData.size() +
            this.flags.size() +
            this.messageOnListen.size() +
            this.isBeingRemoved.size() +
            this.numberOMessagesToSend.size()
        );
    }

    override toString(): string {
        return `CommData {
            commId: ${this.commId.toString()},
            riff: ${this.riff.toString()},
            slotNumber: ${this.slotNumber.toString()},
            slotFlags: ${this.slotFlags.toString()},
            port: ${this.port.toString()},
            protocol: ${this.protocol.toString()},
            userId: ${this.userId.toString()},
            connectedUserCount: ${this.connectedUserCount.toString()},
            openChnnelsCount: ${this.openChnnelsCount.toString()},
            userCanBeMadeReady: ${this.userCanBeMadeReady.toString()},
            userIsReady: ${this.userIsReady.toString()},
            IsChannelOperator: ${this.IsChannelOperator.toString()},
            channeltype: ${this.channeltype.toString()},
            disableBacklog: ${this.disableBacklog.toString()},
            gamneServerIsRunning: ${this.gamneServerIsRunning.toString()},
            shouldLaunchGameServer: ${this.shouldLaunchGameServer.toString()},
            maxReadyUsers: ${this.maxReadyUsers.toString()},
            sku: ${this.sku.toString()},
            sendRate: ${this.sendRate.toString()},
            channelData: ${this.channelData.toString()},
            flags: ${this.flags.toString()},
            messageOnListen: ${this.messageOnListen.toString()},
            isBeingRemoved: ${this.isBeingRemoved.toString()},
            numberOMessagesToSend: ${this.numberOMessagesToSend.toString()}
        }`;
    }
}
