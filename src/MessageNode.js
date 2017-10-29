const logger = require('./logger.js')

// struct msgHead
function msgHead(header) {
    if (!(this instanceof msgHead)) {
        return new msgHead(header)
    }

    this.length = header.readInt16LE()
    this.mcosig = header.toString('ascii', 2)
}

// struct BaseMsgHeader
function BaseMsgHeader(msg) {
    if (!(this instanceof BaseMsgHeader)) {
        return new BaseMsgHeader(msg)
    }

    // WORD	msgNo;
    this.msgNo = msg.readInt16LE()
}

// struct MessageNode
function MessageNode(packet) {
    if (!(this instanceof MessageNode)) {
        return new MessageNode(packet)
    }

    // DWORD	toFrom;		// used to determine whether it was an internally generated msg,
    // 					//  from another server, or truelly from a client
    //
    this.toFrom = Buffer.from([0x00, 0x00])

    // DWORD	appID;		// game specific user id (may or may not be used)

    this.appId = Buffer.from([0x00, 0x00])
    // BYTE	allocType;	// this says what pool it came from (when it is not in a pool)
    // 					//  See POOL_xxxx above
    //
    // #ifdef MCSERVER
    // protected:
    // 	LENSIZE poolSize;	// used by internals of MessagePool
    //
    // public:
    // 	DWORD	QUpTime;			// =GetTickCount() (ms) when the msg is recieved
    // 	DWORD	BeginProcessingTime;// =GetTickCount() (ms) when processing of the msg is started
    // 								// BeginProcessingTime-QUpTime is time spent on Q
    //
    // 	DWORD	TotalSQLExeTime;	// ticks accumulated calling into SQLExecute & related variants
    // 	DWORD	TotalSQLFetchTime;	// ticks accumulated calling into SQLFetch
    //
    // 	DWORD	BeginSQLExeTime;	// work var; =GetTickCount() (ms) just before entering SQLExecute()
    // 	DWORD	BeginSQLFetchTime;	// work var; =GetTickCount() (ms) just before entering SQLFetch()
    // #endif

    // ======================================
    // Everything below is sent across the wire!
    //  (and the initial members need to correspond to struct msgHead)
    // ======================================

    //LENSIZE length;
    //MCO_SIG	mcosig;	// will be equal to MCO_SIG_VAL if to/from MCOTS, else is assumed to be normal TCP/IP protocol of some sort
    //msgHead  header;

    this.setMsgHeader(packet)
    this.setBuffer(packet)

    this.rawBuffer = packet


    if (packet.length <= 6) {
        logger.error('Packet too short!: ', packet)
        return
    }

    //DWORD	seq;	// sequenceNo
    this.seq = packet.readInt32LE(6)

    //BYTE	flags;	// internally IN_QUEUE, or ALLOCATED, externally COMPRESED and/or ENCRYPTED
    // #define	NONE 					0x00
    // #define	COMPRESS_IT				0x01	// Compression Requested at Send Time
    // #define	COMPRESSED				0x02	// The data is ACTUALLY compressed
    // #define	ASCII					0x04	// compress as ASCII (COMPRESSED must be set too).
    // #define	USE_ENCRYPTION			0x08
    // #define	DISCONNECT_AFTER_SEND	0x10	// once this msg is sent; disconnect
    // #define	HEARTBEAT				0x80
    this.flags = packet[10]

    // #ifdef USE_CRC
    // 	WORD	crc;
    // 	DWORD	bytesEncryptedStart;
    // #endif

    //char buffer[1];	// data follows here - [1] allows treatment as pointer

    // MessageNode & operator =(const MessageNode & messageToCopy);
    //
    // void StartSQLExe();
    // void EndSQLExe();
    //
    // void StartSQLFetch();
    // void EndSQLFetch();
    //
    // void ResetSQLTime();
}

MessageNode.prototype.setMsgHeader = function setMsgHeader(packet) {
    const header = Buffer.alloc(6)
    packet.copy(header, 0, 0, 6)
    this.header = msgHead(header)
}

MessageNode.prototype.getBaseMsgHeader = function getBaseMsgHeader(packet) {
    return BaseMsgHeader(packet)
}

MessageNode.prototype.setBuffer = function setSetBuffer(packet) {
    this.buffer = packet.slice(11)
}

module.exports = { MessageNode, BaseMsgHeader }
