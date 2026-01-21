/**
 * Authentication Message IDs
 *
 * These message IDs are used by the authentication system which handles
 * login (port 8226) and persona management (port 8228).
 *
 * @module constants/AuthMessageIds
 */

export const AUTH_MESSAGE_IDS = {
	// ============================================
	// Login messages (port 8226)
	// ============================================

	/** User login request */
	USER_LOGIN: 0x501, // 1281

	// ============================================
	// Persona messages (port 8228)
	// ============================================

	/** Game login / select persona */
	GAME_LOGIN: 0x503, // 1283

	/** Get first buddy */
	GET_FIRST_BUDDY: 0x50b, // 1291

	/** Game logout */
	GAME_LOGOUT: 0x50f, // 1295

	/** Get persona info */
	GET_PERSONA_INFO: 0x519, // 1305

	/** Get persona maps */
	GET_PERSONA_MAPS: 0x532, // 1330

	/** Validate persona name */
	VALIDATE_PERSONA_NAME: 0x533, // 1331

	// ============================================
	// Response messages
	// ============================================

	/** Buddy info response */
	BUDDY_INFO: 0x614, // 1556

	/** Buddy list response */
	BUDDY_LIST: 0x608, // 1544
} as const;

/**
 * Type representing any valid auth message ID
 */
export type AuthMessageId =
	(typeof AUTH_MESSAGE_IDS)[keyof typeof AUTH_MESSAGE_IDS];
