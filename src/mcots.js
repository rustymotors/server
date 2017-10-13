const util = require("./nps_utils.js");

function getDbMsgId(rawBuffer) {
  // 3100 544f4d4303 00000000 b601
  const msgId = `${util.toHex(rawBuffer[12])}${util.toHex(rawBuffer[11])}`;
  switch (msgId) {
    case "01B6":
      return "(01B6) MC_CLIENT_CONNECT_MSG";
    case "01B8":
      return "(01B8) MC_TRACKING_MSG";
    default:
      return `Unknown db msg id: ${msgId}`;
  }
}

// struct LoginCompleteMsg
// {
// 	WORD	msgNo; // MC_LOGIN_COMPLETE = 213 = 0xd5
// 	DWORD	serverTime;
// 	char	firstTime:1;
// 	char	paycheckWaiting:1;
// 	char	clubInviatationsWaiting:1;
// 	char	tallyInProgress:1;
// 	WORD	secondsTillShutdown;
//
// 	double	shardGNP;
// 	DWORD	shardCarsSold;
// 	DWORD	shardAveSalary;
// 	DWORD	shardAveCarsOwned;
// 	DWORD	shardAvePlayerLevel;
//
// 	MCOTSListEntry ServerList[MAX_NUM_MCOTS_SERVERLIST_SLOTS];
//
// 	DWORD	webCookie;	// used by GPS web page to provide some minimal validation of the user;
// 						//  o created by MCOTS; stored into DB at login time
// 						//  o submitted by client in web page posts
// 						//  o java compares this value against PLAYER.WEBCOOKIE
// 	SQL_TIMESTAMP_STRUCT	nextTallyDate;
// 	SQL_TIMESTAMP_STRUCT	nextPaycheckDate;
// };
function msgClientConnect(session, rawData) {
  util.dumpRequest(session.databaseSocket, rawData);

  const packetcontent = Buffer.alloc(8);

  Buffer.from([0x08, 0x00]).copy(packetcontent, 0);

  Buffer.from([0x54, 0x4f, 0x4d, 0x43]).copy(packetcontent, 2);

  Buffer.from([0xd5, 0x00]).copy(packetcontent, 6);

  // const packetresult = packet.buildPacket(31, 0x3100, packetcontent)

  //    const packetresult = packet.craftGenericReply()

  util.dumpResponse(packetcontent, packetcontent.length);
  return packetcontent;
}

module.exports = {
  getDbMsgId,
  msgClientConnect
};
