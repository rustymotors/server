import {
	Cipher,
	Decipher,
	createCipheriv,
	createDecipheriv,
} from "node:crypto";

export type EncryptionSession = {
	connectionId: string;
	customerId: number;
	sessionKey: string;
	gameCipher: Cipher;
	gameDecipher: Decipher;
};

export const encryptionSessions = new Map<string, EncryptionSession>([]);

export function setEncryptionSession(
	encryptionSession: EncryptionSession,
): void {
	encryptionSessions.set(encryptionSession.connectionId, encryptionSession);
}

export function getEncryptionSession(
	connectionId: string,
): EncryptionSession | undefined {
	if (encryptionSessions.has(connectionId)) {
		return encryptionSessions.get(connectionId);
	}
	return undefined;
}

export function deleteEncryptionSession(connectionId: string): void {
	encryptionSessions.delete(connectionId);
}

export function newEncryptionSession({
	connectionId,
	customerId,
	sessionKey,
}: {
	connectionId: string;
	customerId: number;
	sessionKey: string;
}): EncryptionSession {
	/**
	 * Create a new encryption session
	 *
	 * While insecure, the use of DES is required for compatibility with the game
	 */
	const gameCipher = createCipheriv(
		"des-cbc",
		Buffer.from(sessionKey, "hex"),
		Buffer.alloc(8),
	);
	gameCipher.setAutoPadding(false);
	/**
	 * Create a new decryption session
	 *
	 * While insecure, the use of DES is required for compatibility with the game
	 */
	const gameDecipher = createDecipheriv(
		"des-cbc",
		Buffer.from(sessionKey, "hex"),
		Buffer.alloc(8),
	);
	gameDecipher.setAutoPadding(false);
	const encryptionSession = {
		connectionId,
		customerId,
		sessionKey,
		gameCipher,
		gameDecipher,
	};
	setEncryptionSession(encryptionSession);
	return encryptionSession;
}
