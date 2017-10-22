// Connection::Connection()
// {
// 	id				= 0;
// 	appID			= 0;
// 	status			= INACTIVE;
// 	sock			= 0;
// 	port			= 0;
// 	q				= COMMMGR_DEFAULT_Q;
// 	msgEvent		= NULL;
// 	lastMsg			= 0;
// 	sendBacklog		= 0;	// the # of pending sends for this connection
// 	lastBacklogNotify = 0;	// when did we notify about backlog
// 	incommingThread	= NULL;
// 	hbCount			= 0;
// 	sbCount			= 0;			// how many times did we notify about backlog
// 	useEncryption	= 0;
// 	enc				= NULL;
// #ifdef MCSERVER
// 	netInterface	= UnknownInterface;
// #endif
// }

// struct Connection
function Connection() {
  if (!(this instanceof Connection)) {
    return new Connection();
  }

  // id				= 0;
  this.id = 0;

  // 	appID			= 0;
  this.appID = 0;

  // 	status			= INACTIVE;
  this.status = "INACTIVE";

  // 	sock			= 0;
  this.sock = 0;

  // 	msgEvent		= NULL;
  this.msgEvent = NULL;

  // 	lastMsg			= 0;
  this.lastMsg = 0;

  // 	useEncryption	= 0;
  this.useEncryption = 0;
  // 	enc				= NULL;
  this.enc = NULL;
}

// struct TCPManager
function TCPManager() {
  if (!(this instanceof TCPManager)) {
    return new TCPManager();
  }
}

module.exports = TCPManager;
