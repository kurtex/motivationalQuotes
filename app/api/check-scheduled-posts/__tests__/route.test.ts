import { POST } from "../route";
import { connectToDB } from "@/app/lib/database/db"; // Changed to alias
import ScheduledPost from "@/app/lib/database/models/ScheduledPost"; // Changed to alias
import Token from "@/app/lib/database/models/Token"; // Changed to alias
import User from "@/app/lib/database/models/User"; // Changed to alias
import Quote from "@/app/lib/database/models/Quote"; // Changed to alias
import { NextRequest, NextResponse } from "next/server"; // Import NextResponse as well
import { saveUniqueGeminiQuote } from "@/app/lib/database/actions"; // Import the mocked function
import {
	createThreadTextContainer,
	postThreadsTextContainer,
} from "@/app/lib/threads-api/threads-posts/actions"; // Import the mocked functions
import { Query } from "mongoose";

jest.mock("next/server", () => ({
	NextRequest: jest.fn(),
	NextResponse: {
		// Mock NextResponse as an object with static methods
		json: jest.fn((data, options) => ({
			status: options?.status || 200,
			json: () => Promise.resolve(data),
		})),
	},
}));

jest.mock("@/app/lib/database/db", () => ({
	// Changed to alias
	connectToDB: jest.fn(),
}));

jest.mock("@/app/lib/database/models/ScheduledPost", () => {
	const mockQuery = {
		populate: jest.fn().mockReturnThis(),
		sort: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		exec: jest.fn(() =>
			Promise.resolve([
				{
					_id: "1",
					userId: { _id: "user1", active_prompt: { text: "prompt1" } },
					nextScheduledAt: new Date(),
					status: "active",
					timeZoneId: "UTC",
					save: jest.fn().mockResolvedValue(true),
				},
			])
		),
	};

	return {
		find: jest.fn(() => mockQuery),
	};
});

jest.mock("@/app/lib/database/models/Token", () => ({
	findOne: jest.fn(),
}));

jest.mock("@/app/lib/database/models/User", () => ({
	findOne: jest.fn(),
}));

jest.mock("@/app/lib/database/models/Quote", () => {
	const mockQuery = {
		sort: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		then: jest.fn((onFulfilled, onRejected) => {
			// Make 'then' actually call onFulfilled/onRejected
			// Default behavior: resolve with an empty array
			onFulfilled([]);
		}),
	};

	return {
		find: jest.fn(() => mockQuery),
	};
});

jest.mock("@/app/lib/database/actions", () => ({
	saveUniqueGeminiQuote: jest.fn(),
	getPlainThreadsToken: jest.fn(() => "token1"),
}));

jest.mock("@/app/lib/threads-api/threads-posts/actions", () => ({
	createThreadTextContainer: jest.fn(),
	postThreadsTextContainer: jest.fn(),
}));

jest.setTimeout(30000); // Increased global timeout to handle long-running tests

jest.spyOn(ScheduledPost, "find").mockImplementation(() => {
	const mockQuery = {
		populate: jest.fn().mockReturnThis(),
		sort: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		exec: jest.fn(() =>
			Promise.resolve([
				{
					_id: "1",
					userId: { _id: "user1", active_prompt: { text: "prompt1" } },
					nextScheduledAt: new Date(),
					timeOfDay: "14:00",
					timeZoneId: "UTC",
					status: "active",
					save: jest.fn().mockResolvedValue(true),
				},
			])
		),
		then: jest.fn((onFulfilled, onRejected) => {
			if (onFulfilled) {
				onFulfilled([
					{
						_id: "1",
						userId: { _id: "user1", active_prompt: { text: "prompt1" } },
						nextScheduledAt: new Date(),
						timeOfDay: "14:00",
						timeZoneId: "UTC",
						status: "active",
						save: jest.fn().mockResolvedValue(true),
					},
				]);
			}
			return Promise.resolve();
		}),
	};
	return mockQuery as unknown as Query<any, any>;
});

describe("POST /api/check-scheduled-posts", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.CRON_SECRET = "valid-secret"; // Set the secret for tests
	});

	const mockRequest = (headers: Record<string, string>): NextRequest =>
		({
			headers: {
				get: (key: string) => headers[key] ?? headers[key.toLowerCase()],
			},
			cookies: {},
			nextUrl: new URL("http://localhost"),
			page: {},
			ua: "",
		} as unknown as NextRequest);

	it("should return unauthorized if secret is missing", async () => {
		const req = mockRequest({});
		const res = await POST(req);
		const body = await res.json();
		expect(res.status).toBe(401);
		expect(body.error).toBe("Unauthorized");
	});

	it("should process due posts and update their status", async () => {
		jest.setTimeout(15000); // Directly set timeout for this test
		const mockScheduledPostFindResult = ScheduledPost.find();
		// Mock the 'then' method on the result of the chained calls
		(
			mockScheduledPostFindResult.populate("userId").populate("active_prompt")
				.then as jest.Mock
		).mockResolvedValueOnce([
			{
				_id: "1",
				userId: { _id: "user1", active_prompt: { text: "prompt1" } },
				nextScheduledAt: new Date(),
				status: "active",
				save: jest.fn().mockResolvedValue(true),
			},
		]);

		(Token.findOne as jest.Mock).mockResolvedValueOnce({});

		(saveUniqueGeminiQuote as jest.Mock).mockResolvedValueOnce(
			"Generated Quote"
		);

		(createThreadTextContainer as jest.Mock).mockResolvedValueOnce(
			"containerId"
		);
		(postThreadsTextContainer as jest.Mock).mockResolvedValueOnce(true);

		const req = mockRequest({ Authorization: "Bearer valid-secret" });
		const res = await POST(req);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.processedCount).toBe(1);
		expect(saveUniqueGeminiQuote).toHaveBeenCalledWith(
			"token1",
			[], // This will be the empty array from the mock, as we are not mocking Quote.find yet
			5,
			"prompt1"
		);
		expect(createThreadTextContainer).toHaveBeenCalledWith(
			"Generated Quote",
			"token1"
		);
		expect(postThreadsTextContainer).toHaveBeenCalledWith(
			"containerId",
			"token1"
		);
	});
});
