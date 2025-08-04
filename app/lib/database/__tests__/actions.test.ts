import {
	saveThreadsToken,
	updateThreadsToken,
	getMetaUserIdByThreadsAccessToken,
	saveGeminiQuote,
	saveUniqueGeminiQuote,
	deleteUserAndAssociatedData,
} from "../actions";
import { connectToDB } from "../db";
import Quote from "../models/Quote";
import Token from "../models/Token";
import User from "../models/User";
import { GeminiClient } from "../../ai/geminiClient";
import crypto from "crypto";

// Mock dependencies
jest.mock("../db", () => ({
	connectToDB: jest.fn().mockResolvedValue(null),
}));

jest.mock("../models/Quote", () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
		findOne: jest.fn(),
		find: jest.fn(),
		deleteMany: jest.fn(),
	},
}));

jest.mock("../models/Token", () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
		findOne: jest.fn(),
		findOneAndUpdate: jest.fn(),
		deleteMany: jest.fn(),
	},
}));

jest.mock("../models/User", () => ({
	__esModule: true,
	default: {
		findOne: jest.fn(),
		deleteOne: jest.fn(),
	},
}));

jest.mock("../../ai/geminiClient");

jest.mock("crypto", () => ({
	createHash: jest.fn().mockReturnValue({
		update: jest.fn().mockReturnThis(),
		digest: jest.fn().mockReturnValue("mock-hash"),
	}),
}));

const MockedQuote = Quote as jest.Mocked<typeof Quote> & {
	deleteMany: jest.Mock;
};
const MockedToken = Token as jest.Mocked<typeof Token> & {
	deleteMany: jest.Mock;
};
const MockedUser = User as jest.Mocked<typeof User> & { deleteOne: jest.Mock };
const mockGeminiClient = GeminiClient as jest.Mock;
const mockGenerateContent = jest.fn();
const mockEmbedContent = jest.fn();

describe("Database Actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGeminiClient.mockImplementation(() => ({
			generateContent: mockGenerateContent,
			embedContent: mockEmbedContent,
		}));
		MockedQuote.find.mockImplementation(
			() =>
				({
					sort: jest.fn().mockReturnThis(),
					limit: jest.fn().mockResolvedValue([]),
				} as any)
		);
	});

	describe("deleteUserAndAssociatedData", () => {
		it("should delete a user and all their data", async () => {
			const metaUserId = "meta-user-123";
			const dbUserId = "db-user-id-abc";

			MockedUser.findOne.mockResolvedValue({
				_id: dbUserId,
				meta_user_id: metaUserId,
			});
			MockedQuote.deleteMany.mockResolvedValue({ deletedCount: 5 });
			MockedToken.deleteMany.mockResolvedValue({ deletedCount: 1 });
			MockedUser.deleteOne.mockResolvedValue({ deletedCount: 1 });

			const result = await deleteUserAndAssociatedData(metaUserId);

			expect(connectToDB).toHaveBeenCalled();
			expect(MockedUser.findOne).toHaveBeenCalledWith({
				meta_user_id: metaUserId,
			});
			expect(MockedQuote.deleteMany).toHaveBeenCalledWith({ user: dbUserId });
			expect(MockedToken.deleteMany).toHaveBeenCalledWith({
				user_id: metaUserId,
			});
			expect(MockedUser.deleteOne).toHaveBeenCalledWith({ _id: dbUserId });

			expect(result).toEqual({
				success: true,
				deletedQuotes: 5,
				deletedTokens: 1,
				deletedUsers: 1,
			});
		});

		it("should return success without deleting if user is not found", async () => {
			const metaUserId = "non-existent-user";
			MockedUser.findOne.mockResolvedValue(null);

			const result = await deleteUserAndAssociatedData(metaUserId);

			expect(MockedUser.findOne).toHaveBeenCalledWith({
				meta_user_id: metaUserId,
			});
			expect(MockedQuote.deleteMany).not.toHaveBeenCalled();
			expect(MockedToken.deleteMany).not.toHaveBeenCalled();
			expect(MockedUser.deleteOne).not.toHaveBeenCalled();

			expect(result).toEqual({
				success: true,
				deletedQuotes: 0,
				deletedTokens: 0,
				deletedUsers: 0,
			});
		});
	});

	describe("saveThreadsToken", () => {
		it("should save a token successfully", async () => {
			const mockToken = { user_id: "1", access_token: "abc", expires_in: 3600 };
			MockedToken.create.mockResolvedValue(mockToken);
			const result = await saveThreadsToken("1", "abc", 3600);
			expect(connectToDB).toHaveBeenCalled();
			expect(MockedToken.create).toHaveBeenCalled();
			expect(result).toEqual(mockToken);
		});
	});

	describe("updateThreadsToken", () => {
		it("should update a token successfully", async () => {
			const mockToken = { user_id: "1", access_token: "def", expires_in: 7200 };
			MockedToken.findOneAndUpdate.mockResolvedValue(mockToken);
			const result = await updateThreadsToken("1", "def", 7200);
			expect(connectToDB).toHaveBeenCalled();
			expect(MockedToken.findOneAndUpdate).toHaveBeenCalled();
			expect(result).toEqual(mockToken);
		});
	});

	describe("getMetaUserIdByThreadsAccessToken", () => {
		it("should return user_id for a valid token", async () => {
			MockedToken.findOne.mockResolvedValue({ user_id: "123" });
			const userId = await getMetaUserIdByThreadsAccessToken("valid-token");
			expect(userId).toBe("123");
			expect(MockedToken.findOne).toHaveBeenCalledWith({
				access_token: "valid-token",
			});
		});

		it("should throw an error for an invalid token", async () => {
			MockedToken.findOne.mockResolvedValue(null);
			await expect(
				getMetaUserIdByThreadsAccessToken("invalid-token")
			).rejects.toThrow("Token not found");
		});
	});

	describe("saveGeminiQuote", () => {
		beforeEach(() => {
			MockedToken.findOne.mockResolvedValue({ user_id: "user-123" });
			MockedUser.findOne.mockResolvedValue({ _id: "db-user-id" });
			mockEmbedContent.mockResolvedValue([0.1, 0.2]);
			MockedQuote.create.mockResolvedValue({ text: "A new quote" });
		});

		it("should save a unique quote", async () => {
			MockedQuote.findOne.mockResolvedValue(null);
			const result = await saveGeminiQuote("A new quote", "access-token");
			expect(result).toBe("A new quote");
			expect(crypto.createHash).toHaveBeenCalledWith("sha256");
			expect(mockEmbedContent).toHaveBeenCalledWith("A new quote");
			expect(MockedQuote.create).toHaveBeenCalled();
		});

		it("should throw error for duplicate hash", async () => {
			MockedQuote.findOne.mockResolvedValue({ text: "Existing quote" });
			await expect(
				saveGeminiQuote("A new quote", "access-token")
			).rejects.toThrow("Duplicate quote detected (hash)");
		});

		it("should throw error for near-duplicate embedding", async () => {
			MockedQuote.findOne.mockResolvedValue(null);
			MockedQuote.find.mockImplementation(
				() =>
					({
						sort: jest.fn().mockReturnThis(),
						limit: jest.fn().mockResolvedValue([{ embedding: [0.1, 0.21] }]),
					} as any)
			);
			await expect(
				saveGeminiQuote("A new quote", "access-token")
			).rejects.toThrow("Near-duplicate quote detected (embedding)");
		});
	});

	describe("saveUniqueGeminiQuote", () => {
		beforeEach(() => {
			MockedToken.findOne.mockResolvedValue({ user_id: "user-123" });
			MockedUser.findOne.mockResolvedValue({ _id: "db-user-id" });
			mockEmbedContent.mockResolvedValue([0.1, 0.2]);
		});

		it("should generate and save a quote on the first try", async () => {
			mockGenerateContent.mockResolvedValue("A unique quote");
			MockedQuote.findOne.mockResolvedValue(null);
			MockedQuote.create.mockResolvedValue({ text: "A unique quote" });
			const result = await saveUniqueGeminiQuote("access-token", []);
			expect(result).toBe("A unique quote");
			expect(mockGenerateContent).toHaveBeenCalledTimes(1);
		});

		it("should retry on duplicate hash error and succeed", async () => {
			mockGenerateContent
				.mockResolvedValueOnce("Duplicate quote")
				.mockResolvedValueOnce("Unique quote");
			MockedQuote.findOne.mockResolvedValueOnce({ text: "Duplicate quote" });
			MockedQuote.findOne.mockResolvedValueOnce(null);
			MockedQuote.find.mockImplementation(
				() =>
					({
						sort: jest.fn().mockReturnThis(),
						limit: jest.fn().mockResolvedValue([]),
					} as any)
			);
			MockedQuote.create.mockResolvedValue({ text: "Unique quote" });
			const result = await saveUniqueGeminiQuote("access-token", []);
			expect(result).toBe("Unique quote");
			expect(mockGenerateContent).toHaveBeenCalledTimes(2);
		});

		it("should throw after max retries", async () => {
			mockGenerateContent.mockResolvedValue("Duplicate quote");
			MockedQuote.findOne.mockResolvedValue({ text: "Duplicate quote" });
			await expect(
				saveUniqueGeminiQuote("access-token", [], 3)
			).rejects.toThrow("No unique quote could be generated after 3 attempts");
			expect(mockGenerateContent).toHaveBeenCalledTimes(3);
		});
	});
});
