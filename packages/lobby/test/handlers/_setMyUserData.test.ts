import { describe, expect, it, vi, beforeEach } from "vitest";
import { _setMyUserData } from "../../src/handlers/_setMyUserData.js";
import { UserInfoMessage, UserInfo, UserData } from "rusty-motors-shared";
import {loggerMock} from "rusty-motors-shared/test"
import { BytableMessage } from "@rustymotors/binary";

// Mock the databaseManager
vi.mock("rusty-motors-database", () => {
	return {
		databaseManager: {
			getUser: vi.fn(),
			updateUser: vi.fn(),
		},
	};
});

import { databaseManager } from "rusty-motors-database";

describe("_setMyUserData", () => {

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should handle user data update when no differences are found", async () => {
		// Arrange
		const userId = 12345;
		const connectionId = "test-connection-1";

		// Create existing user info
		const existingUserInfo = new UserInfo();
		existingUserInfo.userId = userId;
		existingUserInfo.userName = "testuser";
		existingUserInfo.userData = new UserData();

		// Create incoming message with same data
		const incomingMessage = new UserInfoMessage();
		incomingMessage.userInfo.userId = userId;
		incomingMessage.userInfo.userName = "testuser";
		incomingMessage.userInfo.userData = new UserData();

		// Create a BytableMessage that when serialized returns the UserInfoMessage buffer
		const message = new BytableMessage();
		const serializedData = incomingMessage.serialize();
		message.setFieldValueByName("data", serializedData);
		// Override serialize to return just the data field's buffer (which is the UserInfoMessage)
		message.serialize = () => {
			const dataField = message.getFieldValueByName("data");
			return dataField as Buffer<ArrayBuffer>;
		};

		// getUser is called twice: once before diffObj, once after updateUser
		vi.mocked(databaseManager.getUser)
			.mockResolvedValueOnce(existingUserInfo) // First call before diffObj
			.mockResolvedValueOnce(existingUserInfo); // Second call after updateUser
		vi.mocked(databaseManager.updateUser).mockResolvedValue(undefined);

		// Act
		const result = await _setMyUserData({
			connectionId,
			message,
			log: loggerMock
		});

		// Assert
		expect(databaseManager.getUser).toHaveBeenCalledTimes(2);
		expect(databaseManager.getUser).toHaveBeenNthCalledWith(1, userId);
		expect(databaseManager.updateUser).toHaveBeenCalledWith({
			userId,
			userInfo: incomingMessage.userInfo,
		});
		expect(vi.mocked(loggerMock.warn)).not.toHaveBeenCalled();
		expect(result.connectionId).toBe(connectionId);
		expect(result.messages).toHaveLength(1);
		expect(result.messages[0]).toBeInstanceOf(UserInfoMessage);
	});

	it("should log warning when diffObj detects differences in user data", async () => {
		// Arrange
		const userId = 12345;
		const connectionId = "test-connection-2";

		// Create existing user info with different username
		const existingUserInfo = new UserInfo();
		existingUserInfo.userId = userId;
		existingUserInfo.userName = "olduser";
		existingUserInfo.userData = new UserData();

		// Create incoming message with different username
		const incomingMessage = new UserInfoMessage();
		incomingMessage.userInfo.userId = userId;
		incomingMessage.userInfo.userName = "newuser";
		incomingMessage.userInfo.userData = new UserData();

		// Create a BytableMessage that wraps the UserInfoMessage
		const message = new BytableMessage();
		const serializedData = incomingMessage.serialize();
		message.setFieldValueByName("data", serializedData);
		// Override serialize to return just the data field's buffer (which is the UserInfoMessage)
		message.serialize = () => {
			const dataField = message.getFieldValueByName("data");
			return dataField as Buffer<ArrayBuffer>;
		};

		// getUser is called twice: once before diffObj, once after updateUser
		vi.mocked(databaseManager.getUser)
			.mockResolvedValueOnce(existingUserInfo) // First call before diffObj
			.mockResolvedValueOnce(existingUserInfo); // Second call after updateUser
		vi.mocked(databaseManager.updateUser).mockResolvedValue(undefined);

		// Act
		const result = await _setMyUserData({
			connectionId,
			message,
			log: loggerMock
		});

		// Assert - verify diffObj path was executed
		expect(databaseManager.getUser).toHaveBeenCalledTimes(2);
		expect(databaseManager.getUser).toHaveBeenNthCalledWith(1, userId);
		expect(loggerMock.warn).toHaveBeenCalledWith(
			"Changes in UserInfo",
			expect.objectContaining({
				connectionId,
				userId,
				diffs: [
					expect.objectContaining({
						name: "_username",
					}),
				],
			}),
		);
		expect(databaseManager.updateUser).toHaveBeenCalledWith({
			userId,
			userInfo: incomingMessage.userInfo,
		});
		expect(result.connectionId).toBe(connectionId);
		expect(result.messages).toHaveLength(1);
	});

	it("should log warning when diffObj detects differences in nested userData", async () => {
		// Arrange
		const userId = 12345;
		const connectionId = "test-connection-3";

		// Create existing user info
		const existingUserInfo = new UserInfo();
		existingUserInfo.userId = userId;
		existingUserInfo.userName = "testuser";
		const existingUserData = new UserData();
		existingUserInfo.userData = existingUserData;

		// Create incoming message with different userData
		const incomingMessage = new UserInfoMessage();
		incomingMessage.userInfo.userId = userId;
		incomingMessage.userInfo.userName = "testuser";
		const newUserData = new UserData();
		incomingMessage.userInfo.userData = newUserData;

		// Modify userData to create a difference
		// We need to access the internal structure to create a difference
		// Since UserData is complex, we'll test that the diffObj path is called
		const message = new BytableMessage();
		const serializedData = incomingMessage.serialize();
		message.setFieldValueByName("data", serializedData);
		// Override serialize to return just the data field's buffer (which is the UserInfoMessage)
		message.serialize = () => {
			const dataField = message.getFieldValueByName("data");
			return dataField as Buffer<ArrayBuffer>;
		};

		// getUser is called twice: once before diffObj, once after updateUser
		vi.mocked(databaseManager.getUser)
			.mockResolvedValueOnce(existingUserInfo) // First call before diffObj
			.mockResolvedValueOnce(existingUserInfo); // Second call after updateUser
		vi.mocked(databaseManager.updateUser).mockResolvedValue(undefined);

		// Act
		const result = await _setMyUserData({
			connectionId,
			message,
			log: loggerMock
		});

		// Assert - verify diffObj was called and may have detected differences
		expect(databaseManager.getUser).toHaveBeenCalledWith(userId);
		expect(databaseManager.updateUser).toHaveBeenCalledWith({
			userId,
			userInfo: incomingMessage.userInfo,
		});
		expect(result.connectionId).toBe(connectionId);
		expect(result.messages).toHaveLength(1);
	});

	it("should handle case when user does not exist in database", async () => {
		// Arrange
		const userId = 99999;
		const connectionId = "test-connection-4";

		const incomingMessage = new UserInfoMessage();
		incomingMessage.userInfo.userId = userId;
		incomingMessage.userInfo.userName = "newuser";
		incomingMessage.userInfo.userData = new UserData();

		// Create a BytableMessage that wraps the UserInfoMessage
		const message = new BytableMessage();
		const serializedData = incomingMessage.serialize();
		message.setFieldValueByName("data", serializedData);
		// Override serialize to return just the data field's buffer (which is the UserInfoMessage)
		message.serialize = () => {
			const dataField = message.getFieldValueByName("data");
			return dataField as Buffer<ArrayBuffer>;
		};

		// getUser is called twice: once before diffObj, once after updateUser
		vi.mocked(databaseManager.getUser)
			.mockResolvedValueOnce(undefined) // First call before diffObj - user doesn't exist
			.mockResolvedValueOnce(incomingMessage.userInfo); // Second call after updateUser
		vi.mocked(databaseManager.updateUser).mockResolvedValue(undefined);

		// Act
		const result = await _setMyUserData({
			connectionId,
			message,
			log: loggerMock
		});

		// Assert - diffObj should detect differences when before is undefined
		expect(databaseManager.getUser).toHaveBeenCalledTimes(2);
		expect(databaseManager.getUser).toHaveBeenNthCalledWith(1, userId);
		expect(loggerMock.warn).toHaveBeenCalledWith(
			"Changes in UserInfo",
			expect.objectContaining({
				connectionId,
				userId,
				diffs: expect.any(Array),
			}),
		);
		expect(databaseManager.updateUser).toHaveBeenCalledWith({
			userId,
			userInfo: incomingMessage.userInfo,
		});
		expect(result.connectionId).toBe(connectionId);
		expect(result.messages).toHaveLength(1);
	});

	it("should throw error when user cannot be retrieved after update", async () => {
		// Arrange
		const userId = 12345;
		const connectionId = "test-connection-5";

		const existingUserInfo = new UserInfo();
		existingUserInfo.userId = userId;
		existingUserInfo.userName = "testuser";
		existingUserInfo.userData = new UserData();

		const incomingMessage = new UserInfoMessage();
		incomingMessage.userInfo.userId = userId;
		incomingMessage.userInfo.userName = "testuser";
		incomingMessage.userInfo.userData = new UserData();

		// Create a BytableMessage that wraps the UserInfoMessage
		const message = new BytableMessage();
		const serializedData = incomingMessage.serialize();
		message.setFieldValueByName("data", serializedData);
		// Override serialize to return just the data field's buffer (which is the UserInfoMessage)
		message.serialize = () => {
			const dataField = message.getFieldValueByName("data");
			return dataField as Buffer<ArrayBuffer>;
		};

		vi.mocked(databaseManager.getUser)
			.mockResolvedValueOnce(existingUserInfo) // First call before update
			.mockResolvedValueOnce(undefined); // Second call after update - should fail
		vi.mocked(databaseManager.updateUser).mockResolvedValue(undefined);

		// Act & Assert
		await expect(
			_setMyUserData({
				connectionId,
				message,
				log: loggerMock
			}),
		).rejects.toThrow(`Unable to locate user info for user ${userId}`);
	});
});

