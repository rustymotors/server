/**
 * MCOTS Protocol Message IDs (Little Endian)
 *
 * These message IDs are used by the MCOTS (Motor City Online Transaction System)
 * which handles transaction communications on port 43300.
 *
 * Note: This file contains a minimal set of IDs. Additional IDs should be
 * added as they are discovered and documented.
 *
 * @module constants/MCOTSMessageIds
 */

export const MCOTS_MESSAGE_IDS = {
	// ============================================
	// Transaction messages (port 43300)
	// ============================================

	/** Player info request/response */
	PLAYER_INFO: 122,

	// Additional MCOTS message IDs to be added as discovered
} as const;

/**
 * Type representing any valid MCOTS message ID
 */
export type MCOTSMessageId =
	(typeof MCOTS_MESSAGE_IDS)[keyof typeof MCOTS_MESSAGE_IDS];
