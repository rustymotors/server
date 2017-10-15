// struct msgHead
function msgHead(header) {
  if (!(this instanceof msgHead)) {
    return new msgHead(header);
  }

  this.length = header.readInt16LE();
  this.mcosig = header.toString("ascii", 2);
}

// struct MessageNode
function MessageNode(packet) {
  if (!(this instanceof MessageNode)) {
    return new MessageNode(packet);
  }

  // DWORD	toFrom;		// used to determine whether it was an internally generated msg,
  // 					//  from another server, or truelly from a client
  //
  // DWORD	appID;		// game specific user id (may or may not be used)
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

  this.setMsgHeader(packet);
  this.setBuffer(packet);

  //DWORD	seq;	// sequenceNo
  this.seq = packet.readInt32BE(5);
  //BYTE	flags;	// internally IN_QUEUE, or ALLOCATED, externally COMPRESED and/or ENCRYPTED
  this.flags = packet[6];

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
  header = Buffer.alloc(6);
  packet.copy(header, 0, 0, 6);
  this.header = msgHead(header);
};

MessageNode.prototype.setBuffer = function setSetBuffer(packet) {
  buffer = Buffer.alloc(packet.length - 11);
  packet.copy(buffer, 0, 11);
  this.buffer = buffer;
};

module.exports = MessageNode;
