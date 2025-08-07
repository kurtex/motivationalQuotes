import {
    saveThreadsToken,
    updateThreadsToken,
    getMetaUserIdByThreadsAccessToken,
    saveGeminiQuote,
    saveUniqueGeminiQuote,
    deleteUserAndAssociatedData,
    savePrompt,
    getActivePrompt,
} from "../actions";
import { connectToDB } from "../db";
import Quote from "../models/Quote";
import Token from "../models/Token";
import User from "../models/User";
import Prompt from "../models/Prompt";
import { GeminiClient } from "../../ai/geminiClient";
import crypto from "crypto";

// Mock dependencies
jest.mock("../db", () => ({
    connectToDB: jest.fn().mockResolvedValue(null),
}));

jest.mock("../models/Quote");
jest.mock("../models/Token");
jest.mock("../models/User");
jest.mock("../models/Prompt");
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
});