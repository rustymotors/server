// typedef struct _NPSArg_ConnectToServer
// {
//   /**
//    * The Domain Name or IP Address of the server to connect
//    */
//   char
//     HostName[NPS_HOSTNAME_LEN];
//   /**
//    * The Port to connect on
//    */
//   int
//     Port;
//   /**
//    * Special instructions about how the server should behave and/or
//    * set defaults
//    */
//   unsigned long
//     ServerFlags;
//
//   /**
//    * The initial client descripiton sent to the server
//    */
//   NPS_ClientInfo
//     ClientInfo;
//
//   /**
//    * Callbacks the server delivers messages to
//    */
//   NPS_ServerCallbackInfo
//     ServerCallbacks;
//
//   /**
//    * Called during connection wait states.  Return TRUE to cancel the connection
//    * attempt.  Involked from a separate thread so it is not safe to
//    * use this method to update GUI's.
//    */
//   tfIdleCallBack
//     IdleCallback;
//   /**
//    * Context always passed to idleCallback
//    */
//   void *
//     IdleContext;
//
// #if defined (DO_CRYPTO)
//   /*
//    * The session key from the Login client/dll.
//    * (NPS_SessionKey)
//    */
//   void *skey;
//
//   /*
//    * The customer ID from the Login client/dll.  This is NOT the persona
//    * for this shard.
//    */
//   NPS_CUSTOMERID CustomerID;
//
//   /*
//    * The shard ID from the Login client/dll.
//    */
//   NPS_SHARDID ShardID;
// #endif
//
//   /*
//    * Should only set to TRUE when connecting to the PLS.
//    */
// 	bool	QUse;
//
// 	/*
//    * Position in connection queue, 0 if not set yet.
//    */
// 	volatile short * QPostion;
//
// 	/*
//    * Number of people waiting in connection queue, 0 if not set yet.
//    */
// 	volatile short * QCount;
//
// }NPSArg_ConnectToServer;

// struct LoginPacket
function _NPSArg_ConnectToServer() {
  if (!(this instanceof _NPSArg_ConnectToServer)) {
    return new _NPSArg_ConnectToServer();
  }
}

// HostName[NPS_HOSTNAME_LEN] = 64

module.exports = _NPSArg_ConnectToServer;
