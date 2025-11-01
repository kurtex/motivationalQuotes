import {
    saveThreadsToken,
    updateThreadsToken,
    getMetaUserIdByThreadsAccessToken,
    saveGeminiQuote,
    saveUniqueGeminiQuote,
    deleteUser,
    savePrompt,
    getActivePrompt,
    getTokenExpiration,
} from "../actions";
import { connectToDB } from "../db";
import Quote from "../models/Quote";
import Token from "../models/Token";
import User from "../models/User";
import Prompt from "../models/Prompt";
import ScheduledPost from "../models/ScheduledPost";
import { GeminiClient } from "../../ai/geminiClient";
import crypto from "crypto";

// Mock dependencies
jest.mock("../db", () => ({
    connectToDB: jest.fn().mockResolvedValue(null),
}));

jest.mock("../models/Quote", () => ({
    deleteMany: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
}));
jest.mock("../models/Token", () => ({
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn(),
}));
jest.mock("../models/User", () => ({
    findOne: jest.fn(),
    deleteOne: jest.fn(),
}));
jest.mock("../models/Prompt", () => ({
    create: jest.fn(),
    deleteMany: jest.fn(),
}));
jest.mock("../models/ScheduledPost", () => ({
    deleteMany: jest.fn(),
}));
jest.mock("../../ai/geminiClient");
jest.mock("crypto", () => ({
    createHash: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("mock-hash"),
    }),
}));

const MockedQuote = Quote as jest.Mocked<typeof Quote>;
const MockedToken = Token as jest.Mocked<typeof Token>;
const MockedUser = User as jest.Mocked<typeof User>;
const MockedPrompt = Prompt as jest.Mocked<typeof Prompt>;
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
    });

    describe("savePrompt", () => {
        it("should save a prompt and set it as active", async () => {
            const mockUser = { _id: "user-id", save: jest.fn() };
            MockedToken.findOne.mockResolvedValue({ user_id: "meta-user-id" });
            MockedUser.findOne.mockResolvedValue(mockUser);
            MockedPrompt.create.mockResolvedValue({ _id: "prompt-id", text: "New prompt" });

            const result = await savePrompt("New prompt", "access-token");

            expect(MockedPrompt.create).toHaveBeenCalledWith({ text: "New prompt", user: "user-id" });
            expect(mockUser.active_prompt).toBe("prompt-id");
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toBe("New prompt");
        });
    });

    describe("getActivePrompt", () => {
        it("should return the active prompt text", async () => {
            const mockUser = {
                active_prompt: { text: "Active prompt" },
            };
            MockedToken.findOne.mockResolvedValue({ user_id: "meta-user-id" });
            (MockedUser.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockUser),
            });

            (Quote.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([]),
            });

            const result = await getActivePrompt("access-token");

            expect(result).toBe("Active prompt");
        });

        it("should return null if there is no active prompt", async () => {
            const mockUser = { active_prompt: null };
            MockedToken.findOne.mockResolvedValue({ user_id: "meta-user-id" });
            (MockedUser.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await getActivePrompt("access-token");

            expect(result).toBeNull();
        });
    });

    describe("saveGeminiQuote", () => {
        it("should save a quote with a prompt reference", async () => {
            MockedToken.findOne.mockResolvedValue({ user_id: "user-123" });
            MockedUser.findOne.mockResolvedValue({ _id: "db-user-id" });
            mockEmbedContent.mockResolvedValue([0.1, 0.2]);
            MockedQuote.findOne.mockResolvedValue(null);
            MockedQuote.create.mockResolvedValue({ text: "A new quote" });

            await saveGeminiQuote("A new quote", "access-token", "prompt-id");

            expect(MockedQuote.create).toHaveBeenCalledWith(expect.objectContaining({
                prompt: "prompt-id",
            }));
        });
    });

    describe("saveUniqueGeminiQuote", () => {
        beforeEach(() => {
            MockedToken.findOne.mockResolvedValue({ user_id: "user-123" });
            MockedUser.findOne.mockResolvedValue({ _id: "db-user-id" });
            mockEmbedContent.mockResolvedValue([0.1, 0.2]);
            MockedQuote.findOne.mockResolvedValue(null);
            MockedQuote.create.mockResolvedValue({ text: "A unique quote" });
        });

        it("should build a secure prompt with user input and avoid list", async () => {
            const userPrompt = "A quote about learning";
            const quotesToAvoid = ["Old quote 1", "Old quote 2"];
            mockGenerateContent.mockResolvedValue("A new unique quote");

            await saveUniqueGeminiQuote("access-token", quotesToAvoid, 5, userPrompt);

            const expectedPrompt = `Generate a response based on the user's request, which is enclosed in <user_prompt> tags: <user_prompt>${userPrompt}</user_prompt>\n\nIMPORTANT: Do not generate a response similar to any of the following, which are enclosed in <avoid_list> tags:\n<avoid_list>\n- \"Old quote 1\"\n- \"Old quote 2\"\n</avoid_list>`;
            expect(mockGenerateContent).toHaveBeenCalledWith(expectedPrompt);
        });
    });

    describe("getTokenExpiration", () => {
        it("should return the token's expiration time when found", async () => {
            const mockNow = Math.floor(Date.now() / 1000);
            MockedToken.findOne.mockResolvedValue({ last_updated: mockNow, expires_in: 3600 });
            const result = await getTokenExpiration("test-access-token");
            expect(result).toBe(mockNow + 3600);
        });

        it("should return null if the token is not found", async () => {
            MockedToken.findOne.mockResolvedValue(null);
            const result = await getTokenExpiration("non-existent-token");
            expect(result).toBeNull();
        });
    });

    describe("deleteUser", () => {
        it("should delete a user and all their associated data", async () => {
            const mockUser = { _id: "user-id", meta_user_id: "meta-user-id" };
            MockedToken.findOne.mockResolvedValue({ user_id: "meta-user-id" });
            MockedUser.findOne.mockResolvedValue(mockUser);
            Quote.deleteMany.mockResolvedValue({ deletedCount: 1 });
            Token.deleteMany.mockResolvedValue({ deletedCount: 1 });
            Prompt.deleteMany.mockResolvedValue({ deletedCount: 1 });
            ScheduledPost.deleteMany.mockResolvedValue({ deletedCount: 1 });
            User.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const result = await deleteUser("access-token");

            expect(MockedToken.findOne).toHaveBeenCalledWith({ token_hash: "mock-hash" });
            expect(MockedUser.findOne).toHaveBeenCalledWith({ meta_user_id: "meta-user-id" });
            expect(Quote.deleteMany).toHaveBeenCalledWith({ user: "user-id" });
            expect(Token.deleteMany).toHaveBeenCalledWith({ user_id: "meta-user-id" });
            expect(Prompt.deleteMany).toHaveBeenCalledWith({ user: "user-id" });
            expect(ScheduledPost.deleteMany).toHaveBeenCalledWith({ userId: "user-id" });
            expect(User.deleteOne).toHaveBeenCalledWith({ _id: "user-id" });
            expect(result).toEqual({
                success: true,
                deletedQuotes: 1,
                deletedTokens: 1,
                deletedUsers: 1,
                deletedPrompts: 1,
                deletedScheduledPosts: 1,
            });
        });

        it("should return success if the user is not found", async () => {
            MockedToken.findOne.mockResolvedValue({ user_id: "meta-user-id" });
            MockedUser.findOne.mockResolvedValue(null);

            const result = await deleteUser("access-token");

            expect(result).toEqual({
                success: true,
                deletedQuotes: 0,
                deletedTokens: 0,
                deletedUsers: 0,
                deletedPrompts: 0,
                deletedScheduledPosts: 0,
            });
        });
    });
});