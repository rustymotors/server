/**
 * NPS Protocol Message IDs (Big Endian)
 *
 * These message IDs are used by the NPS (Network Protocol System) which handles
 * lobby, login, and persona communications on ports 7003, 8226, and 8228.
 *
 * @module constants/NPSMessageIds
 */

export const NPS_MESSAGE_IDS = {
	// ============================================
	// Lobby - Unencrypted messages (port 7003)
	// ============================================

	/** User login request */
	USER_LOGIN: 0x100, // 256

	/** Open communication channel */
	OPEN_COMM_CHANNEL: 0x106, // 262

	/** UDP status update */
	UDP_STATUS: 0x125, // 293

	/** Tracking/keepalive ping */
	TRACKING_PING: 0x217, // 535

	/** Encrypted command wrapper */
	ENCRYPTED_COMMAND: 0x1101, // 4353

	// ============================================
	// Lobby - Inside encrypted wrapper (0x1101)
	// ============================================

	/** Get list of users in channel */
	GET_USER_LIST: 0x101, // 257

	/** Set current user's data */
	SET_MY_USER_DATA: 0x103, // 259

	/** Close communication channel */
	CLOSE_COMM_CHANNEL: 0x105, // 261

	/** Start a game server */
	START_GAME_SERVER: 0x10a, // 266

	/** Get server information */
	GET_SERVER_INFO: 0x10c, // 268

	/** Set communication channel flags */
	SET_COMM_FLAGS: 0x10d, // 269

	/** Get ready list */
	GET_READY_LIST: 0x10e, // 270

	/** Set channel data (256-byte ChannelData blob for a comm channel) */
	SET_CHANNEL_DATA: 0x113, // 275

	/** Get mini user list */
	GET_MINI_USER_LIST: 0x128, // 296

	/** Send riff list */
	SEND_RIFF_LIST: 0x302, // 770

	/** Send game servers list */
	SEND_GAME_SERVERS_LIST: 0x309, // 777

	/** Send mini riff list */
	SEND_MINI_RIFF_LIST: 0x30c, // 780

	// ============================================
	// Channel-relay opcodes (server-side routing primitives)
	// ============================================

	/**
	 * Send blob to one specified buddy user.
	 *
	 * Wire layout (verified, see NpsRelaySingleMessage):
	 *   [u16 BE opcode][u16 BE totalLength]
	 *   [u32 BE commId][u32 BE senderUserId][u32 BE recipientUserId]
	 *   [opaque blob]
	 */
	SEND_BUDDY_LONG: 0x93, // 147

	/**
	 * Send blob to one specified user (direct message).
	 *
	 * Wire layout: same SINGLE-family envelope as SEND_BUDDY_LONG above.
	 */
	SEND_SINGLE_LONG: 0x95, // 149

	/**
	 * Send blob to every channel member EXCEPT one specified user.
	 * Typically used by the client to broadcast race/game state to all
	 * other racers in the channel (excluding self).
	 *
	 * Wire layout: same SINGLE-family envelope as SEND_BUDDY_LONG above,
	 * but the filter user is *excluded* rather than the sole recipient.
	 */
	SEND_NOT_SINGLE_LONG: 0x97, // 151

	// ============================================
	// Response messages
	// ============================================

	/** Channel granted response */
	CHANNEL_GRANTED: 0x214, // 532

	/** User joined channel notification */
	USER_JOINED_CHANNEL: 0x20c, // 524

	/** OK to login response */
	OK_TO_LOGIN: 0x230, // 560
} as const;

/**
 * Type representing any valid NPS message ID
 */
export type NPSMessageId = (typeof NPS_MESSAGE_IDS)[keyof typeof NPS_MESSAGE_IDS];
