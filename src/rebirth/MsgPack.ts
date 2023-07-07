// Note: MsgPack class
// Date: 03/23/2020
//..................................................................................................

// "b" is an int64 (blob) (64 bytes)
// "p" is a pointer (32 bytes)
// "l" is an int32 (long) (4 bytes)
// "s" is a short (2 bytes)
// "c" is a char (1 byte)
// "lpb" is a _NPS_UserInfo (long, pointer, byte ) (size 108)
// "lp" ia _NPS_MiniUserInfo (long, pointer) (size 40)
// "l" is a _NPS_UserId_List (long) (size 4)

// "llpppb" is a _NPS_LoginInfo, size _NPS_UserInfo + 147 (size 255)

// "ll" is a _NPS_ClientCount (long, long) (size 8)
// "lplllllsssssspscssllbl" is a _NPS_CommData
//      (long, pointer, long, long, long, long, long, short, short, short, short, short, short, pointer, short, char, short, short, long, byte, long)
//      (size 368)
// "ll" is a _NPS_ChannelClosed (long, long) (size 8)
// "ll" is a _NPS_ForceLeaveChannel (long, long) (size 8)
// "ll" is a _NPS_UserLocation (long, long) (size 8)
// "ppp" is a _NPS_GameServersInfo (pointer. pointer, pointer) (size 207)
// "ll" is a _NPS_GameGerversListheader
// "pllpssssbsslc" is a _NPS_RiffInfo
//      (pointer, long, long, pointer, short, short, short, short, byte, short, short, long, char)
//      (size 72)
// char RiffName[32];
// long Protocol
// long CommID
// char Password[17];
// short ChannelType
// short ConnectedUsers
// short OpenChannels
// short UserIsConnected
// byte ChannelData[256]
// short NumberOfReadyUsers
// short MaxReadyUsers
// long PrivateUserId
// char GameServerIsRunning

// "pls" is a _NPS_MiniRiffInfo (long, pointer, short) (size 42)
// "ll" is a _NPS_RiffListHeader
// "ll" is a _NPS_BootUserFromChannel (long, long) (size 8)
// "ll" is a _ChannelCountInfo
// "ll" is a _NPS_ChannelGrantedData (long, long) (size 8)
// "plplll" is a _NPS_RunningServerInfo
// "ll" is a _NPS_UserLeftChannel (long, long) (size 8)
// "slll" is a NPS_SysErr (short, long, long, long) (size 14)
// "llls" is a _NPS_SlotInfo (long, long, long, short) (size 16)
// "llss" is a _NPS_ReadyForGame (long, long, short, short) (size 12)
// "lplbss" is a _NPS_ChannelCreated
// "lplb" is a _NPS_UserJoinedChannel
// "ls" is a _ReadyForGameInfo
// "lll" is a _NPS_Statisticsheader (long, long, long) (size 12)
// "ll" is a _NPS_SetCommChannelFlags (long, long) (size 8)
// "ls" is a _NPS_StartGame (long, short) (size 6)
// "lp" is a _NPS_GameServerLaunchInfo (long, pointer) (size 24)
// "llc" is a _NPS_GameServerStateInfo
// "ll" is a _NPS_UDPChannelStatus (long, long) (size 8)
// "ll" is a _NPS_ChannelAdmin (long, long) (size 8)

// "ss" is a _NPS_Qposition, size = short + short = 4
// short position;
// short count;

// "l" is a _NPS_LocateUser, (long) (size 4)

// "ll" is a SecondHeader_t (long, long) (size 8)
