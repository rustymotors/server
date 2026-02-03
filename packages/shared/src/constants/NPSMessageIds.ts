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

	/** Get mini user list */
	GET_MINI_USER_LIST: 0x128, // 296

	/** Send riff list */
	SEND_RIFF_LIST: 0x302, // 770

	/** Send game servers list */
	SEND_GAME_SERVERS_LIST: 0x309, // 777

	/** Send mini riff list */
	SEND_MINI_RIFF_LIST: 0x30c, // 780

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
